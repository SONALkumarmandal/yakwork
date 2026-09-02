import Link from "next/link";
import { ArrowUpRight, Sparkles, Terminal } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-panel text-gold shadow-sm">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-mono text-sm font-bold tracking-[0.18em] text-ink uppercase">
              yakwork
            </span>
            <span className="mt-1 text-[10px] font-mono uppercase tracking-[0.24em] text-ink-muted">
              issue radar
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="text-sm text-ink-muted transition hover:text-ink">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm text-ink-muted transition hover:text-ink">
            How it works
          </Link>
          <Link href="/dashboard" className="text-sm text-ink-muted transition hover:text-ink">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden rounded-full border border-line bg-panel px-3 py-2 text-xs font-mono font-semibold text-ink transition hover:border-gold hover:text-gold sm:inline-flex"
          >
            Match profile
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-xs font-mono font-semibold text-gold transition hover:brightness-110"
          >
            <GitHubIcon className="h-3.5 w-3.5" />
            GitHub
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="border-t border-line/60 bg-panel/40 md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-6 py-3 text-xs font-mono text-ink-muted">
          <Link href="/#features" className="transition hover:text-ink">
            Features
          </Link>
          <Link href="/#how-it-works" className="transition hover:text-ink">
            Scoring
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2 py-1 text-gold transition hover:border-gold">
            <Sparkles className="h-3 w-3" />
            Match
          </Link>
        </div>
      </div>
    </header>
  );
}