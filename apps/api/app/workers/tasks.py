"""
This runs on a schedule (see celery_app.py beat schedule), NOT in
response to a user request. It pulls fresh "good first issue"
listings from GitHub and saves them into our own database, so the
`/recommendations` endpoint can serve results instantly from local
data instead of calling GitHub live.
"""
import asyncio
from datetime import datetime

from sqlalchemy import select

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.issue import CachedRepo, CachedIssue
from app.services.github_client import GitHubClient
from app.workers.celery_app import celery_app

LANGUAGES_TO_INDEX = ["Python", "JavaScript", "TypeScript", "Go", "Rust", "Java"]


async def _refresh_issues_for_language(language: str):
    gh = GitHubClient(token=settings.GITHUB_INDEXER_TOKEN or None)
    async with AsyncSessionLocal() as db:
        results = await gh.search_good_first_issues(language=language)

        for item in results.get("items", []):
            repo_full_name = item["repository_url"].split("repos/")[-1]

            repo_result = await db.execute(
                select(CachedRepo).where(CachedRepo.full_name == repo_full_name)
            )
            repo = repo_result.scalar_one_or_none()
            if repo is None:
                # New repo we haven't seen before - fetch its real
                # details (stars, topics) instead of guessing, so the
                # scoring service has accurate popularity data to work with.
                try:
                    repo_details = await gh.get_repo(repo_full_name)
                    has_contributing = await gh.has_contributing_guide(repo_full_name)
                except Exception:
                    # If GitHub rate-limits or the repo was deleted/renamed
                    # mid-index, fall back to sensible defaults rather
                    # than crashing the whole indexing run.
                    repo_details = {}
                    has_contributing = False

                repo = CachedRepo(
                    full_name=repo_full_name,
                    primary_language=repo_details.get("language") or language,
                    stars=repo_details.get("stargazers_count", 0),
                    topics=repo_details.get("topics", []),
                    has_contributing_md=has_contributing,
                )
                db.add(repo)
                await db.flush()  # get repo.id without a full commit

            issue_result = await db.execute(
                select(CachedIssue).where(CachedIssue.github_issue_id == str(item["id"]))
            )
            existing = issue_result.scalar_one_or_none()
            if existing is None:
                # GitHub returns timestamps as ISO strings like
                # "2026-08-30T16:16:02Z" - convert to a real datetime
                # object before handing it to the DB driver.
                created_at = datetime.fromisoformat(item["created_at"].replace("Z", "+00:00"))
                db.add(
                    CachedIssue(
                        repo_id=repo.id,
                        github_issue_id=str(item["id"]),
                        title=item["title"],
                        body=(item.get("body") or "")[:2000],
                        labels=[label["name"] for label in item.get("labels", [])],
                        url=item["html_url"],
                        github_created_at=created_at,
                    )
                )

        await db.commit()
    await gh.close()


async def _refresh_all_languages():
    for language in LANGUAGES_TO_INDEX:
        await _refresh_issues_for_language(language)


@celery_app.task
def refresh_trending_issues():
    """Celery entrypoint - wraps the async function since Celery tasks are sync by default."""
    asyncio.run(_refresh_all_languages())
