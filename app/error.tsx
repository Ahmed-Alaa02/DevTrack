"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary.
 *
 * The most likely failure in a client-persisted app is corrupt or stale data in
 * localStorage — so recovery offers clearing it, not just a retry that would hit
 * the same bad state again.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-danger/20 blur-2xl" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-danger/25 bg-danger/10">
          <AlertTriangle className="size-6 text-danger" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Something broke</h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred while rendering this page."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>
          <RotateCcw />
          Try again
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Clear local data & restart
        </Button>
      </div>
    </div>
  );
}
