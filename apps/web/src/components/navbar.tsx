import Link from "next/link";
import { GitHubIcon } from "@/components/icons";
import { Sparkles, Terminal, ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/70 bg-paper/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-gold shadow-sm group-hover:scale-105 transition-transform">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-base font-bold tracking-tight text-ink flex items-center gap-1">
              yakwork
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            </span>
            <span className="font-mono text-[10px] text-ink-muted -mt-1 tracking-wider uppercase">
              PR Matcher
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-muted">
          <Link href="/dashboard" className="hover:text-ink transition-colors">
            Match Dashboard
          </Link>
          <Link href="/#how-it-works" className="hover:text-ink transition-colors">
            How It Works
          </Link>
          <Link href="/#features" className="hover:text-ink transition-colors">
            Features
          </Link>
          <Link
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors flex items-center gap-1"
          >
            API Docs
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-1.5 text-xs font-mono font-medium text-ink hover:bg-muted transition"
          >
            <GitHubIcon className="h-3.5 w-3.5" />
            <span>Star on GitHub</span>
          </Link>

          <Link
            href="/dashboard"
            className="group flex items-center gap-1.5 rounded-md bg-gold px-4 py-1.5 text-xs font-semibold text-gold-ink hover:brightness-95 shadow-sm transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Launch App</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
}
