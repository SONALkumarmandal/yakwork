// The signature visual for the landing page: a mocked terminal showing
// what "matching" actually looks like, using real git-diff syntax
// (+ additions in green, - removals in red) since that's literally the
// vocabulary of the product's subject matter, not a decorative choice.

const LINES: { type: "cmd" | "add" | "remove" | "muted"; text: string }[] = [
  { type: "cmd", text: "$ yakwork match --lang=python --topic=web" },
  { type: "add", text: "+ good-first-issue   fastapi/fastapi        ★ 78k" },
  { type: "add", text: "+ docs               django/django          ★ 82k" },
  { type: "remove", text: "- stale (212d)       old-flask-plugin      ★ 40" },
  { type: "add", text: "+ help-wanted        pallets/click          ★ 16k" },
  { type: "remove", text: "- no CONTRIBUTING.md unmaintained-lib      ★ 12" },
  { type: "muted", text: "4 matched, 2 filtered out — ranked by fit" },
];

export function DiffPanel() {
  return (
    <div className="w-full rounded-lg border border-line bg-ink text-left shadow-sm overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-remove/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-add/70" />
        <span className="ml-2 font-mono text-xs text-white/40">yakwork — match</span>
      </div>
      <div className="px-4 py-4 font-mono text-[13px] leading-6 sm:text-sm">
        {LINES.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "add"
                ? "text-add"
                : line.type === "remove"
                  ? "text-remove"
                  : line.type === "muted"
                    ? "mt-1 text-white/40"
                    : "text-white/80"
            }
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
