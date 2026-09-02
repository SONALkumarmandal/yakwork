"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import type { PreferenceInput } from "@/types/issue";
import { Search, Plus, X, Sparkles, Hash } from "lucide-react";

const LANGUAGE_OPTIONS = [
  "Python",
  "TypeScript",
  "JavaScript",
  "Go",
  "Rust",
  "Java",
  "C++",
  "Ruby",
];

const POPULAR_TOPICS = [
  "web",
  "cli",
  "ml",
  "devops",
  "api",
  "frontend",
  "backend",
  "database",
  "security",
  "cloud",
  "algorithms",
  "docker",
  "kubernetes",
  "graphql",
  "react",
  "fastapi",
  "docs",
  "testing",
];

export function PreferenceForm({ onSubmit }: { onSubmit: (prefs: PreferenceInput) => void }) {
  const [languages, setLanguages] = useState<string[]>(["Python"]);
  const [topics, setTopics] = useState<string[]>(["web"]);
  const [difficulty, setDifficulty] = useState("good-first-issue");
  const [topicInput, setTopicInput] = useState("");
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  const topicContainerRef = useRef<HTMLDivElement>(null);

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((v) => v !== lang) : [...prev, lang]
    );
  }

  function addTopic(topic: string) {
    const clean = topic.trim().toLowerCase().replace(/^#/, "");
    if (clean && !topics.includes(clean)) {
      setTopics((prev) => [...prev, clean]);
    }
    setTopicInput("");
    setShowTopicSuggestions(false);
  }

  function removeTopic(topic: string) {
    setTopics((prev) => prev.filter((t) => t !== topic));
  }

  // Filtered topic suggestions as user types
  const topicSuggestions = POPULAR_TOPICS.filter(
    (t) =>
      !topics.includes(t) &&
      (topicInput.trim() === "" || t.toLowerCase().includes(topicInput.trim().toLowerCase()))
  );

  // Close topic suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        topicContainerRef.current &&
        !topicContainerRef.current.contains(e.target as Node)
      ) {
        setShowTopicSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ languages, topics, difficulty, contribution_types: [] });
      }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-muted">
            Programming Languages
          </p>
          <span className="text-xs text-ink-muted">Select stacks to search</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => {
            const isSelected = languages.includes(lang);
            return (
              <Badge
                key={lang}
                variant={isSelected ? "selected" : "default"}
                onClick={() => toggleLanguage(lang)}
                className="cursor-pointer font-mono text-xs transition-all hover:border-gold"
              >
                {lang}
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold" />
            Topics & Frameworks
          </p>
          <span className="text-xs text-ink-muted">{topics.length} selected</span>
        </div>

        {/* Selected Topics Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 min-h-[32px]">
          {topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1 rounded-lg bg-gold/15 border border-gold/30 px-2.5 py-1 text-xs font-mono font-medium text-gold-ink dark:text-gold shadow-xs"
            >
              #{topic}
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                aria-label={`Remove topic ${topic}`}
                className="hover:text-remove ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {topics.length === 0 && (
            <span className="text-xs font-mono text-ink-muted">No topics selected yet</span>
          )}
        </div>

        {/* Topic Search & Suggestion Input */}
        <div ref={topicContainerRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
            <input
              type="text"
              placeholder="Search or add topic (e.g. react, machine-learning, devops)..."
              value={topicInput}
              onFocus={() => setShowTopicSuggestions(true)}
              onChange={(e) => {
                setTopicInput(e.target.value);
                setShowTopicSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (topicInput.trim()) {
                    addTopic(topicInput);
                  }
                } else if (e.key === "Escape") {
                  setShowTopicSuggestions(false);
                }
              }}
              className="w-full rounded-lg border border-line bg-paper pl-9 pr-20 py-2 text-xs font-mono text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {topicInput.trim() && (
              <button
                type="button"
                onClick={() => addTopic(topicInput)}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded bg-gold/20 hover:bg-gold px-2 py-0.5 text-[11px] font-mono font-medium text-gold-ink transition"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            )}
          </div>

          {/* Topic Suggestion Dropdown */}
          {showTopicSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl border border-line bg-panel p-2 shadow-xl backdrop-blur-md animate-fade-in-up">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-ink-muted flex items-center justify-between">
                <span>Suggested Topics</span>
                <span>Click to add</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {topicSuggestions.slice(0, 14).map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => addTopic(topic)}
                    className="flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-1 text-xs font-mono text-ink hover:border-gold hover:text-gold-ink hover:bg-gold/10 transition"
                  >
                    <Hash className="h-2.5 w-2.5 opacity-60" />
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-mono font-semibold uppercase tracking-wider text-ink-muted">
          Difficulty Level
        </p>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-56 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="good-first-issue">Good First Issue (Beginner)</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="any">Any Difficulty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto bg-gold hover:brightness-95 text-gold-ink font-semibold px-6 font-mono text-xs shadow-sm"
      >
        <Search className="h-3.5 w-3.5 mr-2" />
        Find Issues for My Stack
      </Button>
    </form>
  );
}
