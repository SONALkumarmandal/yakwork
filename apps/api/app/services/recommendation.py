"""
v1 scoring: simple, explainable, rule-based. Given a user's
preferences and a list of cached issues, rank them.

This is intentionally NOT machine learning yet - get this working and
correct first, then swap in embedding-based matching later without
changing the shape of the rest of the app (see docs for the v2 plan).
"""
import math
from datetime import datetime, timezone

from app.models.issue import CachedIssue, CachedRepo


def score_issue(issue: CachedIssue, repo: CachedRepo, languages: list[str], topics: list[str]) -> float:
    score = 0.0

    # Language match matters most
    if repo.primary_language and repo.primary_language.lower() in [l.lower() for l in languages]:
        score += 2.0

    # Topic overlap
    if topics:
        overlap = set(t.lower() for t in repo.topics) & set(t.lower() for t in topics)
        score += 1.5 * (len(overlap) / max(len(topics), 1))

    # "good first issue" label present is a strong positive
    if any("good first issue" in label.lower() for label in issue.labels):
        score += 1.0

    # Popular repos are (usually) more responsive to new contributors
    if repo.stars > 0:
        score += 0.5 * math.log10(repo.stars + 1)

    # Slightly penalize very old, possibly-abandoned issues
    age_days = (datetime.now(timezone.utc) - issue.github_created_at).days
    if age_days > 180:
        score -= 0.3

    # Bonus if the repo has a CONTRIBUTING.md (usually = friendlier to newcomers)
    if repo.has_contributing_md:
        score += 0.5

    return round(score, 3)


def score_repo(
    repo: CachedRepo,
    languages: list[str],
    topics: list[str],
    issue_count: int = 0,
) -> float:
    score = 0.0

    # Language match
    if repo.primary_language and languages:
        user_langs_lower = [l.lower() for l in languages]
        if repo.primary_language.lower() in user_langs_lower:
            rank = user_langs_lower.index(repo.primary_language.lower())
            score += max(3.0 - (rank * 0.5), 1.0)

    # Topic overlap
    if topics and repo.topics:
        overlap = set(t.lower() for t in repo.topics) & set(t.lower() for t in topics)
        if overlap:
            score += 2.0 * (len(overlap) / max(len(topics[:6]), 1))

    # Stars (popularity)
    if repo.stars > 0:
        score += 0.5 * math.log10(repo.stars + 1)

    # Friendly to contributors
    if repo.has_contributing_md:
        score += 0.5

    # Active good first issues
    if issue_count > 0:
        score += 1.0 + min(issue_count * 0.2, 1.5)

    return round(score, 3)


def rank_repos(
    repos_with_issues: list[tuple[CachedRepo, list[CachedIssue]]],
    languages: list[str],
    topics: list[str],
) -> list[tuple[CachedRepo, list[CachedIssue], float]]:
    scored = [
        (repo, issues, score_repo(repo, languages, topics, len(issues)))
        for repo, issues in repos_with_issues
    ]
    scored.sort(key=lambda x: x[2], reverse=True)
    return scored


def rank_issues(
    issues_with_repos: list[tuple[CachedIssue, CachedRepo]],
    languages: list[str],
    topics: list[str],
) -> list[tuple[CachedIssue, CachedRepo, float]]:
    scored = [
        (issue, repo, score_issue(issue, repo, languages, topics))
        for issue, repo in issues_with_repos
    ]
    scored.sort(key=lambda x: x[2], reverse=True)
    return scored

