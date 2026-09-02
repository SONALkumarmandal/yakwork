import { Card } from "@/components/ui/card";
import { BadgeLabel } from "@/components/ui/badge";
import type { GitHubProfile } from "@/types/issue";
import { User, BookOpen, Users, Sparkles } from "lucide-react";
import Image from "next/image";
export function GitHubProfileCard({
  profile,
  onReset,
}: {
  profile: GitHubProfile;
  onReset?: () => void;
}) {
  return (
    <Card className="overflow-hidden border border-border/80 bg-panel/70 backdrop-blur-sm p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              className="rounded-full border-2 border-gold/40 shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-foreground">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{profile.name || profile.username}</h2>
              <span className="font-mono text-xs text-muted-foreground">@{profile.username}</span>
            </div>
            {profile.bio && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 max-w-lg">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {profile.public_repos} repos
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {profile.followers} followers
            </span>
          </div>
          {onReset && (
            <button
              onClick={onReset}
              className="rounded border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
            >
              Change user
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Detected Stack
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.top_languages.length > 0 ? (
              profile.top_languages.map((lang) => (
                <BadgeLabel key={lang} variant="selected" className="text-xs">
                  {lang}
                </BadgeLabel>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No public languages detected</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Interests & Starred Topics
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profile.top_topics.length > 0 ? (
              profile.top_topics.slice(0, 8).map((topic) => (
                <BadgeLabel key={topic} variant="muted" className="text-xs">
                  #{topic}
                </BadgeLabel>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">General open-source</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
