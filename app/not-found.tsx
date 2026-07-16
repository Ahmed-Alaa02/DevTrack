import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-border bg-card">
          <Compass className="size-6 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          This route isn&apos;t on the roadmap
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The page you were looking for doesn&apos;t exist. The dashboard does.
        </p>
      </div>

      <Button asChild>
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
