from collections import defaultdict
from datetime import datetime
import uuid
import httpx
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.issue import CachedIssue, CachedRepo
from app.schemas.issue import (
    GitHubProfileAnalysis,
    GitHubRecommendationResponse,
    GitHubUserSummary,
    IssueOut,
    RepoRecommendationOut,
)
from app.services.github_client import GitHubClient
from app.services.recommendation import rank_issues, rank_repos

router = APIRouter()


@router.get("/github/suggested-users", response_model=list[GitHubUserSummary])
async def get_suggested_github_users():
    """
    Returns popular and featured open-source developers to suggest before user types.
    """
    gh = GitHubClient(token=settings.GITHUB_INDEXER_TOKEN or None)
    try:
        users = await gh.get_suggested_users()
        return [GitHubUserSummary(**u) for u in users]
    finally:
        await gh.close()


@router.get("/github/search-users", response_model=list[GitHubUserSummary])
async def search_github_users(q: str = Query(default="", max_length=100)):
    """
    Autocomplete endpoint for searching GitHub usernames as you type with fallback.
    """
    clean_q = q.strip()
    gh = GitHubClient(token=settings.GITHUB_INDEXER_TOKEN or None)
    try:
        users = await gh.search_users(clean_q, per_page=6)
        return [GitHubUserSummary(**u) for u in users]
    except Exception:
        # Fallback to curated suggestions matching prefix if any error occurs
        curated = [
            u for u in GitHubClient.POPULAR_USERS
            if clean_q.lower() in u["username"].lower() or (u.get("name") and clean_q.lower() in u["name"].lower())
        ]
        return [GitHubUserSummary(**u) for u in (curated or GitHubClient.POPULAR_USERS[:6])]
    finally:
        await gh.close()



@router.post("/github/exchange-code")
async def exchange_code_for_token(code: str = Query(..., min_length=1, max_length=200)):
    """
    Step 2 of GitHub OAuth: the frontend sends us the one-time `code`
    GitHub handed back after login. We swap it for a real access
    token.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            },
        )
    data = resp.json()
    if "access_token" not in data:
        raise HTTPException(status_code=400, detail="GitHub token exchange failed")

    token = data["access_token"]
    gh = GitHubClient(token)
    profile = await gh.get_authenticated_user()
    await gh.close()

    return {"github_username": profile.get("login"), "avatar_url": profile.get("avatar_url")}


@router.get("/github/profile/{username}", response_model=GitHubProfileAnalysis)
async def analyze_github_profile(
    username: str = Path(..., min_length=1, max_length=39, pattern=r"^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$")
):
    """
    Fetch and analyze any GitHub user's public profile, repositories,
    and starred repos to detect their top languages and interests.
    """
    gh = GitHubClient(token=settings.GITHUB_INDEXER_TOKEN or None)
    try:
        analysis = await gh.analyze_user(username)
        return GitHubProfileAnalysis(**analysis)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
        raise HTTPException(status_code=502, detail="GitHub API communication failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await gh.close()


@router.get("/github/recommendations/{username}", response_model=GitHubRecommendationResponse)
async def get_github_recommendations(
    username: str = Path(..., min_length=1, max_length=39, pattern=r"^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$"),
    db: AsyncSession = Depends(get_db),
):
    """
    Given a GitHub username, inspects their public coding profile & stars,
    extracts languages & topics, and returns tailored open-source
    repositories and good first issues ranked specifically for them.
    """
    gh = GitHubClient(token=settings.GITHUB_INDEXER_TOKEN or None)
    try:
        analysis_data = await gh.analyze_user(username)
        profile_analysis = GitHubProfileAnalysis(**analysis_data)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
        raise HTTPException(status_code=502, detail="GitHub API communication failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await gh.close()

    languages = profile_analysis.top_languages
    topics = profile_analysis.top_topics

    # Query cached issues and repos from local DB
    issues_with_repos = []
    try:
        result = await db.execute(
            select(CachedIssue, CachedRepo).join(CachedRepo, CachedIssue.repo_id == CachedRepo.id)
        )
        rows = result.all()
        issues_with_repos = [(issue, repo) for issue, repo in rows]
    except Exception:
        issues_with_repos = []

    # Render's free web service does not run the Celery indexer, so use a
    # single live GitHub search when the database cache has no results.
    if not issues_with_repos:
        live_gh = GitHubClient(token=settings.GITHUB_INDEXER_TOKEN or None)
        try:
            language = languages[0] if languages else None
            live_results = await live_gh.search_good_first_issues(language=language)
            live_repos: dict[str, CachedRepo] = {}
            for item in live_results.get("items", []):
                repo_full_name = item["repository_url"].split("repos/")[-1]
                repo = live_repos.get(repo_full_name)
                if repo is None:
                    try:
                        repo_details = await live_gh.get_repo(repo_full_name)
                    except Exception:
                        repo_details = {}
                    repo = CachedRepo(
                        id=uuid.uuid4(),
                        full_name=repo_full_name,
                        primary_language=repo_details.get("language") or language,
                        stars=repo_details.get("stargazers_count", 0),
                        topics=repo_details.get("topics", []),
                        has_contributing_md=False,
                    )
                    live_repos[repo_full_name] = repo

                created_at = datetime.fromisoformat(item["created_at"].replace("Z", "+00:00"))
                issue = CachedIssue(
                    id=uuid.uuid4(),
                    repo_id=repo.id,
                    github_issue_id=str(item["id"]),
                    title=item["title"],
                    body=(item.get("body") or "")[:2000],
                    labels=[label["name"] for label in item.get("labels", [])],
                    url=item["html_url"],
                    github_created_at=created_at,
                )
                issues_with_repos.append((issue, repo))
        except Exception:
            issues_with_repos = []
        finally:
            await live_gh.close()

    repo_issues_map = defaultdict(list)
    repo_map = {}
    for issue, repo in issues_with_repos:
        repo_issues_map[repo.id].append(issue)
        repo_map[repo.id] = repo

    repos_with_issues = [(repo, repo_issues_map[repo.id]) for repo in repo_map.values()]

    # Rank repos and issues
    ranked_repos = rank_repos(repos_with_issues, languages, topics)
    ranked_issues = rank_issues(issues_with_repos, languages, topics)

    repos_out = []
    for repo, r_issues, score in ranked_repos[:20]:
        sample_issues_out = [
            IssueOut(
                id=str(iss.id),
                repo_full_name=repo.full_name,
                repo_stars=repo.stars,
                title=iss.title,
                url=iss.url,
                labels=iss.labels,
                language=repo.primary_language,
                created_at=iss.github_created_at,
                score=score,
            )
            for iss in r_issues[:3]
        ]
        repos_out.append(
            RepoRecommendationOut(
                id=str(repo.id),
                full_name=repo.full_name,
                stars=repo.stars,
                primary_language=repo.primary_language,
                topics=repo.topics or [],
                has_contributing_md=repo.has_contributing_md,
                good_first_issues_count=len(r_issues),
                match_score=score,
                sample_issues=sample_issues_out,
            )
        )

    issues_out = [
        IssueOut(
            id=str(issue.id),
            repo_full_name=repo.full_name,
            repo_stars=repo.stars,
            title=issue.title,
            url=issue.url,
            labels=issue.labels,
            language=repo.primary_language,
            created_at=issue.github_created_at,
            score=score,
        )
        for issue, repo, score in ranked_issues[:50]
    ]

    return GitHubRecommendationResponse(
        profile=profile_analysis,
        repos=repos_out,
        issues=issues_out,
        total_repos=len(repos_out),
        total_issues=len(issues_out),
    )

