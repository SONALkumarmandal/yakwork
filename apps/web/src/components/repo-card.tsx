import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BadgeLabel } from "@/components/ui/badge";
import type { RepoRecommendation } from "@/types/issue";
import { Star, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, GitPullRequest } from "lucide-react";

export function RepoCard({ repo }: { repo: RepoRecommendation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border border-border/80 bg-card p-5 shadow-sm hover:border-border transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${repo.full_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-base font-semibold text-foreground hover:text-gold hover:underline flex items-center gap-1.5 transition-colors"
            >
              {repo.full_name}
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
            {repo.has_contributing_md && (
              <span
                title="Has CONTRIBUTING.md guide"
                className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400"
              >
                <CheckCircle2 className="h-3 w-3" />
                Contributing Guide
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {repo.primary_language && (
              <BadgeLabel variant="selected" className="font-mono text-xs">
                {repo.primary_language}
              </BadgeLabel>
            )}
            <span className="flex items-center gap-1 font-mono text-xs text-gold">
              <Star className="h-3.5 w-3.5 fill-gold" />
              {repo.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              <GitPullRequest className="h-3 w-3" />
              {repo.good_first_issues_count} open {repo.good_first_issues_count === 1 ? "issue" : "issues"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="inline-block rounded-md bg-gold/15 px-2.5 py-1 font-mono text-xs font-semibold text-gold-ink dark:text-gold">
              Fit score: {repo.match_score}
            </span>
          </div>
        </div>
      </div>

      {repo.topics && repo.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 6).map((topic) => (
            <BadgeLabel key={topic} variant="muted" className="text-[11px]">
              #{topic}
            </BadgeLabel>
          ))}
        </div>
      )}

      {repo.sample_issues && repo.sample_issues.length > 0 && (
        <div className="mt-4 border-t border-border/50 pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Hide issues" : `View ${repo.sample_issues.length} good first issue${repo.sample_issues.length > 1 ? "s" : ""}`}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2 pl-2 border-l-2 border-border/60">
              {repo.sample_issues.map((issue) => (
                <a
                  key={issue.id}
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-md p-2.5 hover:bg-accent/50 transition-colors"
                >
                  <p className="text-xs font-medium text-foreground group-hover:text-gold transition-colors">
                    {issue.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {issue.labels.map((label) => (
                      <span
                        key={label}
                        className="rounded bg-add/10 px-1.5 py-0.5 text-[10px] font-medium text-add"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
