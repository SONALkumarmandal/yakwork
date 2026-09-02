from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.issue import CachedIssue, CachedRepo
from app.schemas.issue import PreferenceInput, RecommendationResponse, IssueOut
from app.services.recommendation import rank_issues

router = APIRouter()


@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    preferences: PreferenceInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Core endpoint: takes a user's language/topic preferences (either
    typed in manually, or derived from their GitHub profile) and
    returns their best-matching open issues from our locally cached
    pile - see app/workers/tasks.py for how that pile gets filled.
    """
    issues_with_repos = []
    try:
        result = await db.execute(
            select(CachedIssue, CachedRepo).join(CachedRepo, CachedIssue.repo_id == CachedRepo.id)
        )
        rows = result.all()
        issues_with_repos = [(issue, repo) for issue, repo in rows]
    except Exception:
        issues_with_repos = []

    ranked = rank_issues(issues_with_repos, preferences.languages, preferences.topics)

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
        for issue, repo, score in ranked[:50]
    ]

    return RecommendationResponse(issues=issues_out, total=len(issues_out))
