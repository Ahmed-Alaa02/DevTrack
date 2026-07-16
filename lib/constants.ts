import {
  BookOpen,
  Braces,
  Briefcase,
  Container,
  Database,
  Languages,
  LayoutDashboard,
  Library,
  Map,
  MessagesSquare,
  Network,
  NotebookPen,
  Server,
  Settings,
  Sparkles,
  StickyNote,
  Target,
  TrendingUp,
} from "lucide-react";

import type {
  AccentColor,
  Category,
  Difficulty,
  Priority,
  TaskStatus,
} from "@/types";

export const STORAGE_KEY = "developer-goals::state:v1";

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "My Roadmap", href: "/roadmap", icon: Map },
  { label: "Todo List", href: "/todos", icon: NotebookPen },
  { label: "Learning Progress", href: "/progress", icon: TrendingUp },
  { label: "Resources", href: "/resources", icon: Library },
  { label: "Notes", href: "/notes", icon: StickyNote },
  { label: "Statistics", href: "/statistics", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

/* ------------------------------------------------------------------ *
 * Categories
 * ------------------------------------------------------------------ */

export const CATEGORIES: Category[] = [
  {
    id: "backend",
    name: "Backend Development",
    description: "Laravel, PHP, APIs, queues and everything behind the request.",
    icon: Server,
    accent: "violet",
  },
  {
    id: "frontend",
    name: "Frontend Development",
    description: "React, TypeScript and interfaces that feel instant.",
    icon: Braces,
    accent: "blue",
  },
  {
    id: "devops",
    name: "DevOps",
    description: "Containers, pipelines and shipping without fear.",
    icon: Container,
    accent: "orange",
  },
  {
    id: "databases",
    name: "Databases",
    description: "Modelling, indexing and query performance.",
    icon: Database,
    accent: "green",
  },
  {
    id: "architecture",
    name: "Architecture",
    description: "Patterns, principles and systems that scale.",
    icon: Network,
    accent: "indigo",
  },
  {
    id: "soft-skills",
    name: "Soft Skills",
    description: "Communication, ownership and working with humans.",
    icon: MessagesSquare,
    accent: "green",
  },
  {
    id: "career",
    name: "Career",
    description: "Positioning, visibility and long-term compounding.",
    icon: Briefcase,
    accent: "indigo",
  },
  {
    id: "english",
    name: "English",
    description: "Fluency for docs, meetings and interviews.",
    icon: Languages,
    accent: "blue",
  },
  {
    id: "interview",
    name: "Interview Preparation",
    description: "Algorithms, system design and telling your story.",
    icon: Target,
    accent: "red",
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<Category["id"], Category>;

/* ------------------------------------------------------------------ *
 * Accent tokens
 *
 * Tailwind's JIT compiler only sees class names that exist as complete
 * literals in the source, so accents are looked up from this static map
 * rather than interpolated (`bg-${accent}-500` would silently produce
 * nothing in a production build).
 * ------------------------------------------------------------------ */

export interface AccentTokens {
  text: string;
  bg: string;
  softBg: string;
  border: string;
  ring: string;
  gradient: string;
  /** Raw CSS colour for Recharts / canvas, which can't take class names. */
  cssVar: string;
}

export const ACCENTS: Record<AccentColor, AccentTokens> = {
  violet: {
    text: "text-violet",
    bg: "bg-violet",
    softBg: "bg-violet/10",
    border: "border-violet/30",
    ring: "ring-violet/30",
    gradient: "from-violet to-indigo",
    cssVar: "hsl(var(--violet))",
  },
  indigo: {
    text: "text-indigo",
    bg: "bg-indigo",
    softBg: "bg-indigo/10",
    border: "border-indigo/30",
    ring: "ring-indigo/30",
    gradient: "from-indigo to-blue-500",
    cssVar: "hsl(var(--indigo))",
  },
  blue: {
    text: "text-info",
    bg: "bg-info",
    softBg: "bg-info/10",
    border: "border-info/30",
    ring: "ring-info/30",
    gradient: "from-info to-indigo",
    cssVar: "hsl(var(--info))",
  },
  green: {
    text: "text-success",
    bg: "bg-success",
    softBg: "bg-success/10",
    border: "border-success/30",
    ring: "ring-success/30",
    gradient: "from-success to-info",
    cssVar: "hsl(var(--success))",
  },
  orange: {
    text: "text-warning",
    bg: "bg-warning",
    softBg: "bg-warning/10",
    border: "border-warning/30",
    ring: "ring-warning/30",
    gradient: "from-warning to-danger",
    cssVar: "hsl(var(--warning))",
  },
  red: {
    text: "text-danger",
    bg: "bg-danger",
    softBg: "bg-danger/10",
    border: "border-danger/30",
    ring: "ring-danger/30",
    gradient: "from-danger to-warning",
    cssVar: "hsl(var(--danger))",
  },
};

/* ------------------------------------------------------------------ *
 * Enum presentation metadata
 * ------------------------------------------------------------------ */

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; accent: AccentColor; /** 1–4, drives the level pips */ level: number }
> = {
  beginner: { label: "Beginner", accent: "green", level: 1 },
  intermediate: { label: "Intermediate", accent: "blue", level: 2 },
  advanced: { label: "Advanced", accent: "orange", level: 3 },
  expert: { label: "Expert", accent: "red", level: 4 },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; accent: AccentColor; weight: number }
> = {
  low: { label: "Low", accent: "blue", weight: 0 },
  medium: { label: "Medium", accent: "indigo", weight: 1 },
  high: { label: "High", accent: "orange", weight: 2 },
  critical: { label: "Critical", accent: "red", weight: 3 },
};

export const STATUS_META: Record<
  TaskStatus,
  { label: string; accent: AccentColor }
> = {
  "not-started": { label: "Not started", accent: "indigo" },
  "in-progress": { label: "In progress", accent: "orange" },
  completed: { label: "Completed", accent: "green" },
};

/* ------------------------------------------------------------------ *
 * Content
 * ------------------------------------------------------------------ */

export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: "The only way to go fast is to go well.", author: "Robert C. Martin" },
  { text: "Simplicity is a prerequisite for reliability.", author: "Edsger W. Dijkstra" },
  { text: "Programs must be written for people to read.", author: "Harold Abelson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Any fool can write code a computer understands. Good programmers write code humans understand.", author: "Martin Fowler" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
];

export const MOTIVATIONS = [
  "Consistency beats intensity. Show up again today.",
  "You are one commit closer than yesterday.",
  "Small daily wins compound into a senior engineer.",
  "The gap between you and your goal is a few focused hours.",
  "Ship it. Then make it better.",
];

export const APP_META = {
  name: "Developer Goals",
  tagline: "Roadmap OS",
  icon: Sparkles,
};
