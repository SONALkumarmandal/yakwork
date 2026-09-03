import type {
  PreferenceInput,
  RecommendationResponse,
  GitHubProfile,
  GitHubRecommendationResponse,
  GitHubUserSummary,
} from "@/types/issue";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `API request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getRecommendations: (preferences: PreferenceInput) =>
    apiFetch<RecommendationResponse>("/api/v1/recommendations", {
      method: "POST",
      body: JSON.stringify(preferences),
    }),

  analyzeGitHubProfile: (username: string) =>
    apiFetch<GitHubProfile>(`/api/v1/github/profile/${encodeURIComponent(username)}`),

  searchGitHubUsers: (query: string) =>
    apiFetch<GitHubUserSummary[]>(`/api/v1/github/search-users?q=${encodeURIComponent(query)}`),

  getSuggestedUsers: () =>
    apiFetch<GitHubUserSummary[]>("/api/v1/github/suggested-users"),

  getGitHubRecommendations: (username: string) =>
    apiFetch<GitHubRecommendationResponse>(
      `/api/v1/github/recommendations/${encodeURIComponent(username)}`
    ),

  healthCheck: () => apiFetch<{ status: string }>("/api/v1/health"),
};

