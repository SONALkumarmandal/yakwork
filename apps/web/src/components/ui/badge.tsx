import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "border-border bg-transparent text-foreground hover:bg-accent",
        selected: "border-ink bg-ink text-background hover:brightness-110",
        add: "border-transparent bg-add/10 text-add",
        muted: "border-border bg-background text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof badgeVariants>) {
  return <button type="button" className={cn(badgeVariants({ variant, className }))} {...props} />;
}

// Non-interactive version (renders a <span>) for badges used purely as
// labels/tags - e.g. inside a link or card, where nesting a <button>
// would be invalid HTML.
function BadgeLabel({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }), "cursor-default")} {...props} />;
}

export { Badge, BadgeLabel, badgeVariants };
