"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import { GitHubIcon } from "@/components/icons";
import type { GitHubUserSummary } from "@/types/issue";
import {
  Search,
  Loader2,
  X,
  History,
  Sparkles,
  ArrowRight,
  User,
  Trash2,
  CornerDownLeft,
} from "lucide-react";

const STORAGE_KEY = "yakwork_recent_searches";
const MAX_RECENTS = 5;

// Fallback suggestions for offline or instant rendering
const DEFAULT_SUGGESTIONS: GitHubUserSummary[] = [
  {
    username: "tiangolo",
    name: "Sebastián Ramírez",
    avatar_url: "https://avatars.githubusercontent.com/u/1326112?v=4",
    bio: "Creator of FastAPI, Typer, SQLModel",
  },
  {
    username: "shadcn",
    name: "shadcn",
    avatar_url: "https://avatars.githubusercontent.com/u/124599?v=4",
    bio: "Creator of shadcn/ui and taxonomy",
  },
  {
    username: "sindresorhus",
    name: "Sindre Sorhus",
    avatar_url: "https://avatars.githubusercontent.com/u/170270?v=4",
    bio: "Full-time open-sourcerer (chalk, pure-esm)",
  },
  {
    username: "antfu",
    name: "Anthony Fu",
    avatar_url: "https://avatars.githubusercontent.com/u/11247099?v=4",
    bio: "Vue / Vite / Nuxt core team",
  },
  {
    username: "gaearon",
    name: "Dan Abramov",
    avatar_url: "https://avatars.githubusercontent.com/u/810438?v=4",
    bio: "React & Redux co-author",
  },
  {
    username: "torvalds",
    name: "Linus Torvalds",
    avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
    bio: "Creator of Linux and Git",
  },
];

interface GitHubSearchAutocompleteProps {
  initialValue?: string;
  onSelect: (username: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  size?: "default" | "large";
  autoFocus?: boolean;
}

export function GitHubSearchAutocomplete({
  initialValue = "",
  onSelect,
  isLoading = false,
  placeholder = "Type GitHub handle (e.g. tiangolo, shadcn, torvalds)...",
  size = "default",
  autoFocus = false,
}: GitHubSearchAutocompleteProps) {
  const [input, setInput] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<GitHubUserSummary[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [suggestedUsers, setSuggestedUsers] = useState<GitHubUserSummary[]>(DEFAULT_SUGGESTIONS);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  // Sync state during render when initialValue changes from props (avoids effect state cascade)
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setInput(initialValue);
  }

  // Fetch starter suggestions once on mount
  useEffect(() => {
    let isMounted = true;
    api
      .getSuggestedUsers()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setSuggestedUsers(data);
        }
      })
      .catch(() => {
        // Keep DEFAULT_SUGGESTIONS
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const saveRecentSearch = useCallback((username: string) => {
    const trimmed = username.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENTS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage quota error
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = (e: React.MouseEvent, target: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== target.toLowerCase());
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Debounced search query
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length < 2) {
      return;
    }

    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchGitHubUsers(trimmed);
        setSuggestions(results);
        setActiveIndex(-1);
      } catch {
        // Fallback to filtering local default suggestions
        const filtered = DEFAULT_SUGGESTIONS.filter(
          (u) =>
            u.username.toLowerCase().includes(trimmed.toLowerCase()) ||
            (u.name && u.name.toLowerCase().includes(trimmed.toLowerCase()))
        );
        setSuggestions(filtered);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [input]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute active suggestions directly based on input length
  const trimmedInput = input.trim();
  const activeSuggestions = trimmedInput.length < 2 ? [] : suggestions;

  // Compute all selectable items currently displayed in the dropdown
  const displayedItems: { type: "suggestion" | "recent" | "featured"; value: string; summary?: GitHubUserSummary }[] = [];

  if (trimmedInput.length >= 2) {
    activeSuggestions.forEach((s) => {
      displayedItems.push({ type: "suggestion", value: s.username, summary: s });
    });
  } else {
    recentSearches.forEach((r) => {
      displayedItems.push({ type: "recent", value: r });
    });
    suggestedUsers.forEach((s) => {
      displayedItems.push({ type: "featured", value: s.username, summary: s });
    });
  }

  const handleSelect = (username: string) => {
    const clean = username.trim();
    if (!clean) return;
    setInput(clean);
    setIsOpen(false);
    setActiveIndex(-1);
    saveRecentSearch(clean);
    onSelect(clean);
  };

  const handleClear = () => {
    setInput("");
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (displayedItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev < displayedItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayedItems.length - 1));
    } else if (e.key === "Enter") {
      if (isOpen && activeIndex >= 0 && activeIndex < displayedItems.length) {
        e.preventDefault();
        handleSelect(displayedItems[activeIndex].value);
      } else if (input.trim()) {
        e.preventDefault();
        handleSelect(input);
      }
    } else if (e.key === "Tab" && isOpen && activeIndex >= 0 && activeIndex < displayedItems.length) {
      e.preventDefault();
      handleSelect(displayedItems[activeIndex].value);
    }
  };

  // Highlight matching text helper
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const q = query.trim().toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.substring(0, idx)}
        <span className="text-gold font-bold underline underline-offset-2">
          {text.substring(idx, idx + q.length)}
        </span>
        {text.substring(idx + q.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full z-40">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            handleSelect(input);
          }
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          {/* Leading Icon */}
          <GitHubIcon
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted transition-colors ${size === "large" ? "h-5 w-5 left-4" : "h-4 w-4"
              }`}
          />

          {/* Main Input */}
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="github-search-suggestions"
            aria-activedescendant={
              activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined
            }
            autoFocus={autoFocus}
            placeholder={placeholder}
            value={input}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setInput(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className={`w-full rounded-xl border border-line bg-paper text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 font-mono transition shadow-xs ${size === "large"
                ? "pl-12 pr-20 py-3.5 text-base"
                : "pl-10 pr-20 py-2.5 text-sm"
              }`}
          />

          {/* Trailing Controls (Clear Button & Loader) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-ink-muted">
            {loadingSuggestions && (
              <Loader2 className="h-4 w-4 animate-spin text-gold" />
            )}
            {input && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search input"
                className="rounded-md p-1 hover:bg-line/50 hover:text-ink transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`flex items-center justify-center gap-2 rounded-xl bg-gold font-semibold text-gold-ink hover:brightness-95 disabled:opacity-50 shadow-md shadow-gold/15 transition-all shrink-0 ${size === "large" ? "px-7 py-3.5 text-base" : "px-6 py-2.5 text-sm"
            }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span>Match Profile</span>
        </button>
      </form>

      {/* Suggestion Dropdown */}
      {isOpen && (
        <div
          id="github-search-suggestions"
          ref={listboxRef}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-line bg-white shadow-2xl backdrop-blur-xl animate-fade-in-up divide-y divide-line/40 max-h-[420px] overflow-y-auto"
        >
          {/* Mode 1: Search Query Results */}
          {trimmedInput.length >= 2 ? (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-between">
                <span>Matching GitHub Profiles ({activeSuggestions.length})</span>
                <span className="flex items-center gap-1 text-[10px] lowercase opacity-75">
                  <CornerDownLeft className="h-2.5 w-2.5" /> press enter
                </span>
              </div>

              {activeSuggestions.length > 0 ? (
                <div className="mt-1 space-y-1">
                  {activeSuggestions.map((user, idx) => {
                    const isSelected = activeIndex === idx;
                    return (
                      <button
                        key={user.username}
                        id={`suggestion-item-${idx}`}
                        role="option"
                        aria-selected={isSelected}
                        type="button"
                        onClick={() => handleSelect(user.username)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all border ${isSelected
                            ? "bg-gold/15 border-gold text-ink"
                            : "border-transparent hover:bg-gold/10 hover:border-gold/30 text-ink"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.username}
                              width={32}
                              height={32}
                              unoptimized
                              className="h-8 w-8 rounded-full border border-line shrink-0 group-hover:border-gold transition-colors object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-semibold truncate text-ink">
                              @{renderHighlightedText(user.username, trimmedInput)}
                              {user.name && (
                                <span className="ml-2 font-normal text-xs text-ink-muted">
                                  ({renderHighlightedText(user.name, trimmedInput)})
                                </span>
                              )}
                            </p>
                            {user.bio ? (
                              <p className="text-[11px] text-ink-muted truncate max-w-sm sm:max-w-md">
                                {user.bio}
                              </p>
                            ) : (
                              <p className="text-[11px] text-ink-muted">GitHub User Profile</p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`flex items-center gap-1 text-xs font-mono font-medium text-gold shrink-0 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                        >
                          Match <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : !loadingSuggestions ? (
                <div className="p-4 text-center">
                  <p className="text-xs font-mono text-ink-muted">
                    No matching users found for &quot;{trimmedInput}&quot;.
                  </p>
                  <p className="mt-1 text-[11px] text-gold cursor-pointer hover:underline" onClick={() => handleSelect(trimmedInput)}>
                    Press enter or click here to match &quot;{trimmedInput}&quot; anyway
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            /* Mode 2: Empty/Short Input Suggestions (Recent + Featured) */
            <div className="space-y-3 pt-1">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-muted flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <History className="h-3 w-3" /> Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[10px] text-remove hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-2.5 w-2.5" /> Clear
                    </button>
                  </div>
                  <div className="mt-1 space-y-1">
                    {recentSearches.map((rec, rIdx) => {
                      const itemIdx = rIdx;
                      const isSelected = activeIndex === itemIdx;
                      return (
                        <div
                          key={rec}
                          id={`suggestion-item-${itemIdx}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(rec)}
                          onMouseEnter={() => setActiveIndex(itemIdx)}
                          className={`group flex items-center justify-between rounded-xl px-3 py-1.5 cursor-pointer text-left transition-all border ${isSelected
                              ? "bg-gold/15 border-gold text-ink"
                              : "border-transparent hover:bg-panel hover:border-line text-ink"
                            }`}
                        >
                          <div className="flex items-center gap-2.5 font-mono text-xs text-ink">
                            <History className="h-3.5 w-3.5 text-ink-muted" />
                            <span>@{rec}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, rec)}
                            title="Remove from history"
                            className="text-ink-muted hover:text-remove p-1 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular / Featured Suggestions */}
              <div>
                <div className="px-3 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-gold" /> Suggested Profiles
                </div>
                <div className="mt-1 space-y-1">
                  {suggestedUsers.slice(0, 5).map((user, sIdx) => {
                    const itemIdx = recentSearches.length + sIdx;
                    const isSelected = activeIndex === itemIdx;
                    return (
                      <button
                        key={user.username}
                        id={`suggestion-item-${itemIdx}`}
                        role="option"
                        aria-selected={isSelected}
                        type="button"
                        onClick={() => handleSelect(user.username)}
                        onMouseEnter={() => setActiveIndex(itemIdx)}
                        className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all border ${isSelected
                            ? "bg-gold/15 border-gold text-ink"
                            : "border-transparent hover:bg-gold/10 hover:border-gold/30 text-ink"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.username}
                              width={32}
                              height={32}
                              unoptimized
                              className="h-8 w-8 rounded-full border border-line shrink-0 group-hover:border-gold transition-colors object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-semibold text-ink group-hover:text-gold-ink">
                              @{user.username}
                              {user.name && (
                                <span className="ml-1.5 font-normal text-ink-muted">
                                  {user.name}
                                </span>
                              )}
                            </p>
                            {user.bio && (
                              <p className="text-[11px] text-ink-muted truncate max-w-xs sm:max-w-sm">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`flex items-center gap-1 text-xs font-mono font-medium text-gold shrink-0 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                        >
                          Select <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Quick Shortcuts */}
          <div className="px-3 py-2 text-[10px] font-mono text-ink-muted flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="rounded bg-paper px-1.5 py-0.5 border border-line/60">↑ ↓</span> to navigate
              <span className="rounded bg-paper px-1.5 py-0.5 border border-line/60">esc</span> to close
            </span>
            <span className="text-gold font-medium">Yakwork Smart Radar</span>
          </div>
        </div>
      )}
    </div>
  );
}