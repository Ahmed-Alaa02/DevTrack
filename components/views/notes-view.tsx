"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pin, PinOff, Plus, StickyNote, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { RippleButton } from "@/components/common/ripple-button";
import { Badge } from "@/components/ui/badge";
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
import { Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { CATEGORIES, CATEGORY_MAP } from "@/lib/constants";
import { cardHover, fadeUp, staggerContainer } from "@/lib/motion";
import { formatDate } from "@/lib/utils";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import { useUIStore } from "@/store/use-ui-store";
import type { CategoryId, Note } from "@/types";

/**
 * The scratchpad — short, durable lessons that don't belong to a single task.
 *
 * Pinned notes sort first, then by recency. The whole card opens the editor, and
 * pin/delete are hover-revealed: at rest the page is just the notes, which is
 * the point of a notes page.
 */
export function NotesView() {
  const notes = useRoadmapStore((s) => s.notes);
  const toggleNotePin = useRoadmapStore((s) => s.toggleNotePin);
  const deleteNote = useRoadmapStore((s) => s.deleteNote);
  const query = useUIStore((s) => s.filters.query);
  const hydrated = useHydrated();

  const [editing, setEditing] = React.useState<Note | null>(null);
  const [creating, setCreating] = React.useState(false);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
        )
      : notes;

    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [notes, query]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Second brain"
        title="Notes"
        description="The things you'd otherwise re-learn in six months. Keep them short and specific."
        actions={
          <RippleButton onClick={() => setCreating(true)}>
            <Plus />
            New note
          </RippleButton>
        }
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title={query ? "No notes match that search" : "No notes yet"}
          description={
            query
              ? "Try a different term, or clear the search."
              : "Write down the gotcha you just spent two hours on. Future you will thank you."
          }
          action={
            !query ? (
              <Button variant="secondary" onClick={() => setCreating(true)}>
                <Plus />
                Write your first note
              </Button>
            ) : undefined
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((note) => {
              const category = note.categoryId ? CATEGORY_MAP[note.categoryId] : null;

              return (
                <motion.div
                  key={note.id}
                  layout
                  variants={fadeUp}
                  exit={{ opacity: 0, scale: 0.95 }}
                  {...cardHover}
                >
                  <Card className="group relative flex h-full flex-col p-5">
                    {note.pinned && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-warning/10 blur-2xl"
                      />
                    )}

                    <div className="relative flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(note)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <h2 className="truncate text-sm font-semibold">{note.title}</h2>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatDate(note.updatedAt)}
                        </p>
                      </button>

                      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleNotePin(note.id)}
                          aria-label={note.pinned ? "Unpin note" : "Pin note"}
                        >
                          {note.pinned ? (
                            <PinOff className="size-3.5" />
                          ) : (
                            <Pin className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteNote(note.id)}
                          aria-label="Delete note"
                          className="text-muted-foreground hover:text-danger"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditing(note)}
                      className="mt-3 flex-1 text-left"
                    >
                      <p className="line-clamp-5 text-xs leading-relaxed text-muted-foreground">
                        {note.body}
                      </p>
                    </button>

                    <div className="mt-4 flex items-center gap-2">
                      {category && (
                        <Badge variant={category.accent} size="sm">
                          {category.name}
                        </Badge>
                      )}
                      {note.pinned && (
                        <Badge variant="orange" size="sm" className="ml-auto">
                          <Pin className="size-2.5" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <NoteEditor
        open={creating || editing !== null}
        note={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

/**
 * Create and edit share one dialog — the only difference is whether it opens
 * seeded. Two nearly-identical forms would be the classic place for them to
 * drift apart.
 */
function NoteEditor({
  open,
  note,
  onClose,
}: {
  open: boolean;
  note: Note | null;
  onClose: () => void;
}) {
  const upsertNote = useRoadmapStore((s) => s.upsertNote);

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<CategoryId | "none">("none");

  // Re-seed whenever the dialog opens against a different note.
  React.useEffect(() => {
    if (!open) return;
    setTitle(note?.title ?? "");
    setBody(note?.body ?? "");
    setCategoryId(note?.categoryId ?? "none");
  }, [open, note]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() && !body.trim()) return;

    upsertNote({
      id: note?.id,
      title: title.trim() || "Untitled note",
      body: body.trim(),
      categoryId: categoryId === "none" ? null : categoryId,
      pinned: note?.pinned ?? false,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "New note"}</DialogTitle>
          <DialogDescription>
            One idea per note. If it needs headings, it's a blog post.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="note-title" className="text-xs font-medium text-muted-foreground">
              Title
            </label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Queue worker gotcha"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="note-body" className="text-xs font-medium text-muted-foreground">
              Note
            </label>
            <Textarea
              id="note-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you learn?"
              rows={6}
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Category</span>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v as CategoryId | "none")}
            >
              <SelectTrigger className="h-10" aria-label="Note category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <RippleButton type="submit">{note ? "Save changes" : "Create note"}</RippleButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
