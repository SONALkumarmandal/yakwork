"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiffPanel } from "@/components/diff-panel";
import { GitHubSearchAutocomplete } from "@/components/github-search-autocomplete";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  GitPullRequest,
  Star,
  CheckCircle2,
} from "lucide-react";

const STATS = [
  { label: "Daily Issues Indexed", value: "5,000+" },
  { label: "Supported Languages", value: "6 Major Stacks" },
  { label: "Health-Checked Repos", value: "100%" },
  { label: "Stale Issue Filter", value: "Active" },
];

const FEATURES = [
  {
    icon: <Sparkles className="h-5 w-5 text-gold" />,
    title: "GitHub Profile Intelligence",
    description:
      "We inspect your public repos and starred libraries to determine your actual coding stack, topics of interest, and framework preferences.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-add" />,
    title: "Dead Issue & Stale PR Shield",
    description:
      "Nothing is more frustrating than solving an abandoned issue. Our scoring penalizes inactive repos and stale listings older than 180 days.",
  },
  {
    icon: <BookOpen className="h-5 w-5 text-gold" />,
    title: "Newcomer Readiness Radar",
    description:
      "Prioritizes repositories that have verified CONTRIBUTING.md guidelines and clear, actionable setup instructions.",
  },
  {
    icon: <Zap className="h-5 w-5 text-remove" />,
    title: "Instant Scoring & Matching",
    description:
      "Rule-based transparent scoring that balances language fit, topic overlap, popularity, and maintainer responsiveness.",
  },
];

const SAMPLE_REPOS = [
  {
    name: "fastapi/fastapi",
    lang: "Python",
    stars: "78.4k",
    topic: "web",
    hasGuide: true,
    issue: "Add support for custom response encoders in streaming",
  },
  {
    name: "shadcn/ui",
    lang: "TypeScript",
    stars: "82.1k",
    topic: "ui",
    hasGuide: true,
    issue: "Docs: update accessibility table for dialog component",
  },
  {
    name: "tokio-rs/tokio",
    lang: "Rust",
    stars: "26.3k",
    topic: "async",
    hasGuide: true,
    issue: "Improve documentation around task cancellation",
  },
];

export default function Home() {
  const router = useRouter();

  const handleHeroSearch = (username: string) => {
    if (username.trim()) {
      router.push(`/dashboard?username=${encodeURIComponent(username.trim())}`);
    }
  };

  return (
    <main className="flex-1 overflow-hidden">
      {/* Hero Section */}
      <section className="relative z-30 pt-20 pb-20 sm:pt-28 sm:pb-28">
        {/* Ambient Glows */}
        <div className="glow-ambient -top-20 left-1/2 -translate-x-1/2 h-72 w-96 bg-gold/15 animate-pulse-glow" />
        <div className="glow-ambient top-60 right-10 h-64 w-64 bg-add/10 animate-float" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-3.5 py-1 text-xs font-mono text-ink-muted backdrop-blur-md shadow-sm animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-add animate-ping" />
            <span>Live GitHub Good-First-Issue Radar</span>
            <span className="text-gold font-semibold">• v1.0 Live</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-7 font-mono text-4xl sm:text-6xl font-bold tracking-tight text-ink leading-tight sm:leading-none animate-fade-in-up">
            Find the open-source issue <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gold via-amber-600 to-gold bg-clip-text text-transparent">
              worth your first pull request.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-ink-muted">
            Stop digging through thousands of stale GitHub issues. Yakwork scans, filters, and ranks open-source tasks tailored specifically to your GitHub coding stack and interests.
          </p>

          {/* Interactive Live Search Bar with Suggestions on Hero */}
          <div className="relative z-40 mt-9 mx-auto max-w-xl text-left">
            <div className="rounded-2xl border border-line/80 bg-panel/90 p-2 shadow-xl backdrop-blur-md">
              <GitHubSearchAutocomplete
                onSelect={handleHeroSearch}
                size="large"
                placeholder="Search any GitHub username to discover issues..."
              />
            </div>
          </div>

          {/* Quick Search Teaser */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-ink-muted">
            <span className="text-muted-foreground">Try with popular handles:</span>
            {["tiangolo", "shadcn", "sindresorhus", "antfu", "torvalds"].map((handle) => (
              <Link
                key={handle}
                href={`/dashboard?username=${handle}`}
                className="rounded-md border border-line bg-panel/80 px-2.5 py-1 hover:border-gold hover:text-ink transition shadow-xs"
              >
                @{handle}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="relative z-10 border-y border-line bg-panel/70 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="font-mono text-2xl sm:text-3xl font-bold text-ink">{stat.value}</p>
                <p className="mt-1 text-xs text-ink-muted uppercase tracking-wider font-mono">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Diff / Terminal Showcase */}
      <section className="relative mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold font-semibold">
            Engineered For Beginners & Pros Alike
          </p>
          <h2 className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-ink">
            Transparent Matching, Zero Noise
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Every issue is evaluated through real criteria: language compatibility, repo health, and contributor friendliness.
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-gold/30 to-add/20 blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
          <div className="relative">
            <DiffPanel />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="border-t border-line bg-panel/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold font-semibold">
              Features
            </p>
            <h2 className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-ink">
              Built to make your first PR successful
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              We took everything frustrating about finding beginner issues and automated it.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-line bg-panel p-6 shadow-sm hover:border-gold/60 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper border border-line/60 shadow-xs group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="mt-4 font-mono text-sm font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Sample Repos Showcase */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold font-semibold">
                Live Repositories
              </p>
              <h2 className="mt-1 font-mono text-2xl sm:text-3xl font-bold text-ink">
                Popular projects ready for contributors
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-gold hover:underline"
            >
              <span>Explore all in Dashboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {SAMPLE_REPOS.map((r) => (
              <div
                key={r.name}
                className="flex flex-col justify-between rounded-xl border border-line bg-panel p-5 shadow-sm hover:border-border transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-ink">{r.name}</span>
                    <span className="flex items-center gap-1 font-mono text-xs text-gold">
                      <Star className="h-3 w-3 fill-gold" />
                      {r.stars}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-paper border border-line px-2.5 py-0.5 font-mono text-[11px] text-ink">
                      {r.lang}
                    </span>
                    <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[11px] text-ink-muted">
                      #{r.topic}
                    </span>
                    {r.hasGuide && (
                      <span className="flex items-center gap-1 text-[10px] text-add font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Guide
                      </span>
                    )}
                  </div>

                  <div className="mt-4 rounded-lg bg-paper p-3 border border-line/60">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-ink">
                      <GitPullRequest className="h-3.5 w-3.5 text-add" />
                      <span className="line-clamp-2">{r.issue}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line/50 text-right">
                  <Link
                    href="/dashboard"
                    className="text-xs font-mono text-gold-ink hover:text-gold font-medium transition"
                  >
                    View matched tasks →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Step Sequence */}
      <section id="how-it-works" className="border-t border-line bg-panel/70 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold font-semibold">
              The Workflow
            </p>
            <h2 className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-ink">
              From zero to your first merged PR
            </h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3 relative">
            <div className="rounded-xl border border-line bg-paper p-6 relative">
              <span className="font-mono text-xs font-bold text-gold bg-gold/15 px-2.5 py-1 rounded-md">
                01
              </span>
              <h3 className="mt-4 font-mono text-base font-semibold text-ink">
                Inspect Profile
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Connect your GitHub username or manually pick your favorite programming languages and tags.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-paper p-6 relative">
              <span className="font-mono text-xs font-bold text-gold bg-gold/15 px-2.5 py-1 rounded-md">
                02
              </span>
              <h3 className="mt-4 font-mono text-base font-semibold text-ink">
                Rank Repos & Issues
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Our algorithm scores open listings across GitHub, filtering dead issues and verifying newcomer documentation.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-paper p-6 relative">
              <span className="font-mono text-xs font-bold text-gold bg-gold/15 px-2.5 py-1 rounded-md">
                03
              </span>
              <h3 className="mt-4 font-mono text-base font-semibold text-ink">
                Ship Your Contribution
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Pick an issue with clear guidance, fork the repo, submit your pull request, and earn your contributor badge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final High-Impact CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-ink p-10 sm:p-14 text-center shadow-xl">
            <div className="glow-ambient -top-10 -right-10 h-64 w-64 bg-gold/20" />
            <div className="glow-ambient -bottom-10 -left-10 h-64 w-64 bg-add/20" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-gold">
                <Sparkles className="h-3 w-3" />
                Start Contributing Today
              </span>

              <h2 className="mt-4 font-mono text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Ready to make your first commit count?
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-white/70">
                Join thousands of developers using Yakwork to discover welcoming open-source communities.
              </p>

              <div className="mt-8 flex items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-gold px-8 py-3 text-sm font-semibold text-gold-ink hover:brightness-105 shadow-lg shadow-gold/20 transition-all hover:scale-105"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
