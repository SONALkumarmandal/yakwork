"""
Pydantic schemas = the "shape" of data going in and out of the API.
These are what show up in the auto-generated docs at /docs, and what
the frontend's TypeScript types should mirror.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PreferenceInput(BaseModel):
    languages: list[str] = Field(default=[], max_length=30)
    topics: list[str] = Field(default=[], max_length=50)
    difficulty: str = Field(default="good-first-issue", max_length=50)
    contribution_types: list[str] = Field(default=[], max_length=30)


class IssueOut(BaseModel):
    id: str
    repo_full_name: str
    repo_stars: int
    title: str
    url: str
    labels: list[str]
    language: str | None
    created_at: datetime
    score: float  # how well this matches the requesting user, 0-1

    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    issues: list[IssueOut]
    total: int


class RepoRecommendationOut(BaseModel):
    id: str
    full_name: str
    stars: int
    primary_language: str | None = None
    topics: list[str] = []
    has_contributing_md: bool = False
    good_first_issues_count: int = 0
    match_score: float
    sample_issues: list[IssueOut] = []

    model_config = ConfigDict(from_attributes=True)


class GitHubUserSummary(BaseModel):
    username: str
    name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    public_repos: int | None = None


class GitHubProfileAnalysis(BaseModel):
    username: str
    name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    public_repos: int = 0
    followers: int = 0
    top_languages: list[str] = []
    top_topics: list[str] = []


class GitHubRecommendationResponse(BaseModel):
    profile: GitHubProfileAnalysis
    repos: list[RepoRecommendationOut]
    issues: list[IssueOut]
    total_repos: int
    total_issues: int

