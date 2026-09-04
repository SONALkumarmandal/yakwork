"use client";

import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { PreferenceForm } from "@/components/preference-form";
import { IssueCard } from "@/components/issue-card";
import { RepoCard } from "@/components/repo-card";
import { GitHubProfileCard } from "@/components/github-profile-card";
import { GitHubSearchAutocomplete } from "@/components/github-search-autocomplete";
import { GitHubIcon } from "@/components/icons";
import type {
  Issue,
  RepoRecommendation,
  GitHubProfile,
  PreferenceInput,
} from "@/types/issue";
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  FolderGit2,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  Filter,
  Flame,
  X,
  Tag,
} from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"github" | "manual">("github");
  const [activeTab, setActiveTab] = useState<"repos" | "issues">("repos");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "stars">("score");

  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<RepoRecommendation[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubSearch = useCallback(async (username: string) => {
    const userToSearch = username.trim();
    if (!userToSearch) return;

    setLoading(true);
    setError(null);
    try {
      const result = await api.getGitHubRecommendations(userToSearch);
      setProfile(result.profile);
      setRepos(result.repos);
      setIssues(result.issues);
      setActiveTab("repos");
      setSearchFilter("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch GitHub recommendations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle URL query parameters (e.g., ?username=tiangolo or ?q=shadcn)
  useEffect(() => {
    const queryUser = searchParams.get("username") || searchParams.get("q");

    if (queryUser && !profile && !loading) {
      const timeout = setTimeout(() => {
        handleGitHubSearch(queryUser);
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [searchParams, profile, loading, handleGitHubSearch]);

  async function handleManualSubmit(preferences: PreferenceInput) {
    setLoading(true);
    setError(null);
    setProfile(null);
    try {
      const result = await api.getRecommendations(preferences);
      setIssues(result.issues);
      setRepos([]);
      setActiveTab("issues");
      setSearchFilter("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Couldn't reach the backend.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleResetProfile() {
    router.replace("/dashboard");
    setProfile(null);
    setRepos([]);
    setIssues([]);
    setSearchFilter("");
  }

  // Extract top filter suggestion chips from currently loaded results
  const availableFilterSuggestions = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.primary_language) set.add(r.primary_language);
      (r.topics || []).slice(0, 3).forEach((t) => set.add(t));
    });
    issues.forEach((i) => {
      if (i.language) set.add(i.language);
      (i.labels || []).slice(0, 2).forEach((l) => set.add(l));
    });
    return Array.from(set).slice(0, 8);
  }, [repos, issues]);

  // Filtered & Sorted Repos
  const filteredRepos = useMemo(() => {
    let list = [...repos];
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.primary_language?.toLowerCase().includes(q) ||
          r.topics.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sortBy === "stars") {
      list.sort((a, b) => b.stars - a.stars);
    } else {
      list.sort((a, b) => b.match_score - a.match_score);
    }
    return list;
  }, [repos, searchFilter, sortBy]);

  // Filtered & Sorted Issues
  const filteredIssues = useMemo(() => {
    let list = [...issues];
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.repo_full_name.toLowerCase().includes(q) ||
          i.language?.toLowerCase().includes(q) ||
          i.labels.some((l) => l.toLowerCase().includes(q))
      );
    }
    if (sortBy === "stars") {
      list.sort((a, b) => b.repo_stars - a.repo_stars);
    } else {
      list.sort((a, b) => b.score - a.score);
    }
    return list;
  }, [issues, searchFilter, sortBy]);

  return (
    <main className="flex-1 bg-paper/50 pb-20">
      {/* Top Banner / System Status */}
      <div className="border-b border-line/60 bg-panel/50 px-6 py-2.5 backdrop-blur-xs">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-xs font-mono text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-add animate-pulse" />
            <span>FastAPI & GitHub live indexer ready</span>
          </div>
          <span className="hidden sm:inline">
            Matching via public repositories, stars & good-first-issues
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-10">
        {/* Header Title Section */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left justify-between gap-6 pb-8 border-b border-line/60">
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-center gap-2 mb-1 sm:justify-start">
              <span className="rounded-md bg-gold/15 px-2.5 py-2 font-mono text-xs font-semibold text-gold-ink">
                Contribution Radar
              </span>
            </div>
            <h1 className="font-mono text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Find Your Match
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Discover repositories ready for your first pull request, ranked by your stack.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex self-center sm:self-auto rounded-xl border border-line bg-panel p-1.5 shadow-sm">
            <button
              onClick={() => setMode("github")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-semibold transition ${mode === "github"
                  ? "bg-ink text-gold shadow-xs"
                  : "text-ink-muted hover:text-ink"
                }`}
            >
              <GitHubIcon className="h-3.5 w-3.5" />
              GitHub Match
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-semibold transition ${mode === "manual"
                  ? "bg-ink text-gold shadow-xs"
                  : "text-ink-muted hover:text-ink"
                }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Manual Search
            </button>
          </div>
        </div>

        {/* Search Inputs Card */}
        <div className="mt-8">
          {mode === "github" ? (
            <div>
              {!profile ? (
                <div className="relative z-30 rounded-2xl border border-line bg-panel p-7 shadow-sm transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <h2 className="font-mono text-sm font-bold text-ink">
                      Enter any GitHub Username
                    </h2>
                  </div>
                  <p className="text-xs text-ink-muted mb-5 leading-relaxed max-w-xl">
                    Type any GitHub handle to see instant autocomplete suggestions, recent search history, and live profile stack matching.
                  </p>

                  {/* GitHub Search with Full Autocomplete */}
                  <GitHubSearchAutocomplete
                    onSelect={(username) => handleGitHubSearch(username)}
                    isLoading={loading}
                    placeholder="Search GitHub handle (e.g. tiangolo, shadcn, torvalds)..."
                  />

                  {/* Popular Suggestion Chips */}
                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-ink-muted pt-4 border-t border-line/50">
                    <span className="font-mono text-[11px]">Popular suggestions:</span>
                    {["tiangolo", "shadcn", "sindresorhus", "antfu", "gaearon"].map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => handleGitHubSearch(handle)}
                        className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[11px] hover:border-gold hover:text-ink transition"
                      >
                        @{handle}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <GitHubProfileCard profile={profile} onReset={handleResetProfile} />
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-panel p-7 shadow-sm">
              <PreferenceForm onSubmit={handleManualSubmit} />
            </div>
          )}
        </div>

        {/* Loading State Skeleton */}
        {loading && (
          <div className="mt-12 space-y-4">
            <div className="flex items-center justify-center gap-3 py-6">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
              <p className="font-mono text-sm font-medium text-ink">
                Scoring repositories & filtering issues against GitHub...
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-xl border border-line bg-panel p-5 space-y-3">
                  <div className="h-4 w-1/2 rounded shimmer-loading" />
                  <div className="h-3 w-3/4 rounded shimmer-loading" />
                  <div className="h-6 w-1/3 rounded shimmer-loading" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-remove/30 bg-remove/10 p-5 text-remove">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Unable to fetch recommendations</p>
              <p className="text-xs opacity-90 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && (repos.length > 0 || issues.length > 0) && (
          <div className="mt-10 animate-fade-in-up">
            {/* Control Bar: Tabs + Search + Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
              {/* Tab Toggles */}
              <div className="flex gap-2">
                {repos.length > 0 && (
                  <button
                    onClick={() => setActiveTab("repos")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-bold transition-all ${activeTab === "repos"
                        ? "bg-ink text-gold shadow-sm"
                        : "text-ink-muted hover:text-ink hover:bg-panel"
                      }`}
                  >
                    <FolderGit2 className="h-3.5 w-3.5" />
                    Matched Repositories ({filteredRepos.length})
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("issues")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-bold transition-all ${activeTab === "issues"
                      ? "bg-ink text-gold shadow-sm"
                      : "text-ink-muted hover:text-ink hover:bg-panel"
                    }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  Good First Issues ({filteredIssues.length})
                </button>
              </div>

              {/* Instant Filter & Sort */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Filter results..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="rounded-lg border border-line bg-panel pl-8 pr-7 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none w-44 sm:w-52 font-mono"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-mono text-ink-muted">
                  <ArrowUpDown className="h-3 w-3" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "score" | "stars")}
                    className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink focus:border-gold focus:outline-none font-mono"
                  >
                    <option value="score">Sort: Highest Fit</option>
                    <option value="stars">Sort: Most Stars</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filter Suggestion Chips */}
            {availableFilterSuggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-ink-muted text-[11px] flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Filter suggestions:
                </span>
                {availableFilterSuggestions.map((tag) => {
                  const isActive = searchFilter.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchFilter(isActive ? "" : tag)}
                      className={`rounded-md px-2 py-0.5 text-[11px] border transition ${isActive
                          ? "bg-gold text-gold-ink border-gold font-semibold"
                          : "border-line bg-panel text-ink hover:border-gold hover:text-gold-ink"
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter("")}
                    className="text-[10px] text-remove hover:underline ml-1"
                  >
                    Reset filter
                  </button>
                )}
              </div>
            )}

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === "repos" && filteredRepos.length > 0 ? (
                <div className="space-y-4">
                  {filteredRepos.map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              ) : activeTab === "issues" && filteredIssues.length > 0 ? (
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-panel p-10 text-center text-ink-muted">
                  <Filter className="mx-auto h-8 w-8 opacity-40 mb-2" />
                  <p className="text-xs font-mono">No matches found for &quot;{searchFilter}&quot;</p>
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter("")}
                      className="mt-3 inline-block rounded-md border border-line bg-paper px-3 py-1 text-xs font-mono text-gold hover:border-gold transition"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && repos.length === 0 && issues.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-line bg-panel/50 p-14 text-center">
            <Flame className="mx-auto h-12 w-12 text-gold/60 animate-bounce" />
            <h3 className="mt-4 font-mono text-base font-bold text-ink">
              Ready to find your first issue
            </h3>
            <p className="mt-2 text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
              Enter your GitHub handle above to auto-detect your stack, or switch to manual filters to pick languages and explore indexed beginner issues.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

