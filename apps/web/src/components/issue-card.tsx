import { Card } from "@/components/ui/card";
import { BadgeLabel } from "@/components/ui/badge";
import type { Issue } from "@/types/issue";
import { ExternalLink, Star, GitPullRequest } from "lucide-react";

export function IssueCard({ issue }: { issue: Issue }) {
  const formattedDate = new Date(issue.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block transition-all"
    >
      <Card className="p-5 border-border/80 bg-card hover:border-gold/60 hover:shadow-md transition-all hover:-translate-y-0.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-add shrink-0" />
            <span className="font-mono text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {issue.repo_full_name}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/60">• {formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex items-center gap-1 font-mono text-xs text-gold">
              <Star className="h-3 w-3 fill-gold" />
              {issue.repo_stars.toLocaleString()}
            </span>
            {issue.score > 0 && (
              <span className="rounded bg-gold/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-gold-ink dark:text-gold">
                Score: {issue.score}
              </span>
            )}
          </div>
        </div>

        <h3 className="mt-2 text-sm sm:text-base font-semibold text-foreground group-hover:text-gold transition-colors flex items-center gap-1.5">
          <span>{issue.title}</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </h3>

        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {issue.language && (
            <BadgeLabel variant="selected" className="font-mono text-[11px]">
              {issue.language}
            </BadgeLabel>
          )}
          {issue.labels.map((label) => (
            <BadgeLabel key={label} variant="add" className="text-[11px]">
              {label}
            </BadgeLabel>
          ))}
        </div>
      </Card>
    </a>
  );
}

