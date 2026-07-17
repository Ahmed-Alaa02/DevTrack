"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Database,
  Download,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
  User,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { RippleButton } from "@/components/common/ripple-button";
import { Avatar, AvatarFallback, AvatarImage, initialsOf } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap } from "@/hooks/use-roadmap";
import { STORAGE_KEY } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/motion";
import {
  buildTaskExport,
  exportFileName,
  parseTaskImport,
  TaskImportError,
} from "@/lib/transfer";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import type { Task } from "@/types";

/**
 * Settings.
 *
 * Everything writes straight to the persisted store — there's no Save button
 * because there's nothing to save to. The destructive actions (reset, clear) are
 * the only things gated behind a confirmation.
 */
export function SettingsView() {
  const { profile } = useRoadmap();
  const updateProfile = useRoadmapStore((s) => s.updateProfile);
  const theme = useRoadmapStore((s) => s.theme);
  const setTheme = useRoadmapStore((s) => s.setTheme);
  const resetAll = useRoadmapStore((s) => s.resetAll);
  const clearAll = useRoadmapStore((s) => s.clearAll);
  const importTasks = useRoadmapStore((s) => s.importTasks);
  const tasks = useRoadmapStore((s) => s.tasks);
  const notes = useRoadmapStore((s) => s.notes);
  const hydrated = useHydrated();

  const [confirmReset, setConfirmReset] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const isEmpty = tasks.length === 0 && notes.length === 0;

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState<Task[] | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(buildTaskExport(tasks), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName();
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the input so choosing the same file twice still fires onChange.
    event.target.value = "";
    if (!file) return;

    setImportError(null);
    try {
      const parsed = parseTaskImport(await file.text());
      setPending(parsed);
    } catch (error) {
      setImportError(
        error instanceof TaskImportError
          ? error.message
          : "Couldn't read that file.",
      );
    }
  };

  const runImport = (mode: "merge" | "replace") => {
    if (!pending) return;
    importTasks(pending, mode);
    setPending(null);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Your profile, your pace, your data. All of it stays in this browser."
      />

      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* ---- Profile ---- */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <SectionHeading
              icon={User}
              title="Profile"
              description="Shown in the sidebar and the dashboard greeting."
            />

            <div className="mt-6 flex items-center gap-4">
              <Avatar className="size-14 ring-1 ring-white/10">
                {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
                <AvatarFallback className="text-lg">
                  {initialsOf(profile.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="text-sm font-medium">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.role}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                id="profile-name"
                label="Name"
                value={profile.name}
                onChange={(name) => updateProfile({ name })}
                placeholder="Your name"
              />
              <Field
                id="profile-role"
                label="Role"
                value={profile.role}
                onChange={(role) => updateProfile({ role })}
                placeholder="e.g. Backend Engineer"
              />
              <div className="sm:col-span-2">
                <Field
                  id="profile-avatar"
                  label="Avatar URL"
                  value={profile.avatarUrl ?? ""}
                  onChange={(url) => updateProfile({ avatarUrl: url || null })}
                  placeholder="https://… (leave empty to use initials)"
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0">
                <p className="text-sm font-medium">Daily goal</p>
                <p className="text-xs text-muted-foreground">
                  Tasks you aim to complete each day. Drives the Today&apos;s Goal card.
                </p>
              </div>
              <Input
                type="number"
                min={1}
                max={20}
                aria-label="Daily goal"
                value={profile.dailyGoal}
                onChange={(e) =>
                  // Guard the parse: an empty input yields NaN, which would
                  // divide by zero in the goal card.
                  updateProfile({ dailyGoal: Math.max(1, Number(e.target.value) || 1) })
                }
                className="w-20 shrink-0 text-center"
              />
            </div>
          </Card>
        </motion.div>

        {/* ---- Appearance ---- */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <SectionHeading
              icon={theme === "dark" ? Moon : Sun}
              title="Appearance"
              description="The app is designed dark-first. The light token set exists and is wired up — flip it if you must."
            />

            <div className="mt-6 flex items-center justify-between gap-6 rounded-xl border border-border bg-secondary/30 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">
                  Currently <span className="font-mono">{theme}</span>
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            </div>
          </Card>
        </motion.div>

        {/* ---- Data ---- */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <SectionHeading
              icon={Database}
              title="Data"
              description="Everything is persisted to localStorage under a single versioned key. No account, no server, no telemetry."
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat label="Tasks" value={tasks.length} />
              <Stat label="Notes" value={notes.length} />
              <Stat label="Storage key" value={STORAGE_KEY} mono />
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">Export / import tasks</p>
                <p className="text-xs text-muted-foreground">
                  Save your tasks to a file, or load a file someone shared so you both
                  work from the same roadmap.
                </p>
                {importError && (
                  <p className="mt-2 text-xs text-destructive" role="alert">
                    {importError}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  onClick={handleExport}
                  disabled={tasks.length === 0}
                >
                  <Download />
                  Export
                </Button>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <Upload />
                  Import
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">Reset to sample data</p>
                <p className="text-xs text-muted-foreground">
                  Replaces your roadmap with the seeded one. This cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setConfirmReset(true)}
                className="shrink-0"
              >
                <RotateCcw />
                Reset data
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">Clear all data</p>
                <p className="text-xs text-muted-foreground">
                  Removes every task, note and day of activity, leaving an empty roadmap
                  to build from scratch. This cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setConfirmClear(true)}
                disabled={isEmpty}
                className="shrink-0"
              >
                <Trash2 />
                Clear data
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import {pending?.length ?? 0} tasks</DialogTitle>
            <DialogDescription>
              Add them to your current {tasks.length} tasks, or replace your whole roadmap
              with the imported ones. Replacing cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <RippleButton variant="destructive" onClick={() => runImport("replace")}>
                Replace all
              </RippleButton>
              <RippleButton onClick={() => runImport("merge")}>
                <Upload />
                Add to roadmap
              </RippleButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset everything?</DialogTitle>
            <DialogDescription>
              Your {tasks.length} tasks, {notes.length} notes and all activity history will
              be replaced with the original sample data. There is no undo.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Keep my data
            </Button>
            <RippleButton
              variant="destructive"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
              }}
            >
              <RotateCcw />
              Yes, reset
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear everything?</DialogTitle>
            <DialogDescription>
              Your {tasks.length} tasks, {notes.length} notes and all activity history will
              be deleted, leaving an empty roadmap. Your profile and theme are kept. There
              is no undo.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Keep my data
            </Button>
            <RippleButton
              variant="destructive"
              onClick={() => {
                clearAll();
                setConfirmClear(false);
              }}
            >
              <Trash2 />
              Yes, clear it
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof User;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/60">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={`mt-1 truncate text-sm ${mono ? "font-mono text-[11px]" : "font-semibold tabular-nums"}`}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}
