import Link from "next/link";
import { Terminal, Heart } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="border-t border-line/80 bg-panel/60 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-gold">
                <Terminal className="h-3.5 w-3.5" />
              </div>

              <span className="font-mono text-base font-bold text-ink">
                yakwork
              </span>
            </div>

            <p className="text-xs leading-relaxed text-ink-muted">
              Find open-source repositories and issues worth your first pull
              request. Matched to your GitHub coding stack and interests.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-ink-muted">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-add" />
              <span>GitHub Live Indexer Active</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
              Navigation
            </h4>

            <ul className="mt-3 space-y-2 text-xs text-ink-muted">
              <li>
                <Link
                  href="/dashboard"
                  className="transition hover:text-ink"
                >
                  Match Dashboard
                </Link>
              </li>

              <li>
                <Link
                  href="/#how-it-works"
                  className="transition hover:text-ink"
                >
                  How Scoring Works
                </Link>
              </li>

              <li>
                <Link
                  href="/#features"
                  className="transition hover:text-ink"
                >
                  Platform Features
                </Link>
              </li>

              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-ink"
                >
                  FastAPI OpenAPI Specs
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Supported Languages */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
              Supported Stacks
            </h4>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                "Python",
                "TypeScript",
                "JavaScript",
                "Go",
                "Rust",
                "Java",
                "Docker",
                "React",
              ].map((lang) => (
                <span
                  key={lang}
                  className="rounded border border-line bg-background px-2 py-0.5 font-mono text-[11px] text-ink-muted"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Col 4: Open Source */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
              Community
            </h4>

            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              Built for developers taking the leap from learning to active
              open-source contributors.
            </p>

            <div className="mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-1.5 font-mono text-xs text-ink transition hover:bg-muted"
              >
                <GitHubIcon className="h-3.5 w-3.5" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line/60 pt-6 text-xs text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Yakwork. Open-source initiative.</p>

          <p className="flex items-center gap-1">
            Built with{" "}
            <Heart className="h-3 w-3 fill-remove text-remove" /> for
            first-time contributors
          </p>
        </div>
      </div>
    </footer>
  );
}