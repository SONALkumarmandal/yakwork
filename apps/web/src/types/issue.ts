// These mirror app/schemas/issue.py on the backend exactly, so the
// frontend always knows the shape of what the API returns.

export interface Issue {
  id: string;
  repo_full_name: string;
  repo_stars: number;
  title: string;
  url: string;
  labels: string[];
  language: string | null;
  created_at: string;
  score: number;
}

export interface RecommendationResponse {
  issues: Issue[];
  total: number;
}

export interface PreferenceInput {
  languages: string[];
  topics: string[];
  difficulty: string;
  contribution_types: string[];
}

export interface RepoRecommendation {
  id: string;
  full_name: string;
  stars: number;
  primary_language: string | null;
  topics: string[];
  has_contributing_md: boolean;
  good_first_issues_count: number;
  match_score: number;
  sample_issues: Issue[];
}

export interface GitHubUserSummary {
  username: string;
  name?: string | null;
  avatar_url: string | null;
  bio?: string | null;
  public_repos?: number | null;
}

export interface GitHubProfile {
  username: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  top_languages: string[];
  top_topics: string[];
}

export interface GitHubRecommendationResponse {
  profile: GitHubProfile;
  repos: RepoRecommendation[];
  issues: Issue[];
  total_repos: number;
  total_issues: number;
}


