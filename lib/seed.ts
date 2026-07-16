import type { ActivityDay, Note, Task, UserProfile } from "@/types";
import { addDays, toISODate, uid } from "@/lib/utils";

/**
 * Seed data is authored as *relative* day offsets rather than absolute dates so
 * a freshly-cloned repo always shows a live-looking roadmap (some overdue, some
 * due this week) instead of a wall of dates from whenever this file was written.
 */
type SeedTask = Omit<
  Task,
  "id" | "order" | "createdAt" | "completedAt" | "deadline" | "subtasks" | "resources"
> & {
  /** Days from today. Negative = overdue. `null` = no deadline. */
  dueIn: number | null;
  /** Days ago the task entered the roadmap. */
  createdDaysAgo: number;
  subtasks?: string[];
  resources?: Task["resources"];
};

const SEED_TASKS: SeedTask[] = [
  /* ---------------------------- Backend ---------------------------- */
  {
    categoryId: "backend",
    title: "Master Laravel",
    description:
      "Go past CRUD: service container, lifecycle, contracts, and the parts of the framework that make large codebases stay readable.",
    difficulty: "advanced",
    estimatedHours: 40,
    priority: "critical",
    status: "in-progress",
    progress: 65,
    dueIn: 12,
    createdDaysAgo: 48,
    tags: ["php", "laravel", "framework"],
    subtasks: [
      "Service container & providers",
      "Request lifecycle deep dive",
      "Eloquent relationships at scale",
      "Testing with Pest",
    ],
    resources: [
      { label: "Laravel Docs", url: "https://laravel.com/docs" },
      { label: "Laracasts", url: "https://laracasts.com" },
    ],
  },
  {
    categoryId: "backend",
    title: "Build REST APIs",
    description:
      "Resourceful routing, API resources, versioning, pagination, rate limiting and error contracts clients can rely on.",
    difficulty: "intermediate",
    estimatedHours: 16,
    priority: "high",
    status: "completed",
    progress: 100,
    dueIn: -6,
    createdDaysAgo: 40,
    tags: ["api", "rest", "http"],
    subtasks: ["API resources", "Versioning strategy", "Cursor pagination", "Problem+JSON errors"],
  },
  {
    categoryId: "backend",
    title: "Authentication",
    description:
      "Sanctum vs Passport, token lifetimes, refresh flows, 2FA and password reset that doesn't leak account existence.",
    difficulty: "intermediate",
    estimatedHours: 12,
    priority: "high",
    status: "in-progress",
    progress: 45,
    dueIn: 4,
    createdDaysAgo: 30,
    tags: ["auth", "security", "sanctum"],
    subtasks: ["Sanctum SPA auth", "Token abilities", "Two-factor flow", "Rate-limited login"],
  },
  {
    categoryId: "backend",
    title: "Queues",
    description:
      "Move slow work off the request. Workers, retries, backoff, failed job tables and idempotent handlers.",
    difficulty: "intermediate",
    estimatedHours: 10,
    priority: "medium",
    status: "in-progress",
    progress: 30,
    dueIn: 9,
    createdDaysAgo: 26,
    tags: ["queues", "horizon", "async"],
    subtasks: ["Horizon setup", "Retry & backoff", "Idempotency keys", "Failed job recovery"],
  },
  {
    categoryId: "backend",
    title: "Events",
    description:
      "Event-driven decoupling: listeners, subscribers, queued events, and knowing when an event is the wrong tool.",
    difficulty: "intermediate",
    estimatedHours: 8,
    priority: "medium",
    status: "not-started",
    progress: 0,
    dueIn: 18,
    createdDaysAgo: 20,
    tags: ["events", "decoupling"],
    subtasks: ["Listeners vs subscribers", "Queued listeners", "Model events pitfalls"],
  },
  {
    categoryId: "backend",
    title: "Broadcasting",
    description:
      "Realtime with Reverb/Pusher: private and presence channels, auth callbacks, and reconnect handling.",
    difficulty: "advanced",
    estimatedHours: 10,
    priority: "low",
    status: "not-started",
    progress: 0,
    dueIn: 30,
    createdDaysAgo: 18,
    tags: ["websockets", "realtime", "reverb"],
    subtasks: ["Private channels", "Presence channels", "Client reconnect strategy"],
  },
  {
    categoryId: "backend",
    title: "Caching",
    description:
      "Cache tags, TTL strategy, stampede protection and the two hard problems (this is the naming one's sibling).",
    difficulty: "intermediate",
    estimatedHours: 8,
    priority: "high",
    status: "not-started",
    progress: 0,
    dueIn: 7,
    createdDaysAgo: 15,
    tags: ["cache", "performance"],
    subtasks: ["Cache tags", "Stale-while-revalidate", "Stampede locks"],
  },
  {
    categoryId: "backend",
    title: "PHP Design Patterns",
    description:
      "Strategy, repository, decorator, factory — applied to real Laravel code, not UML diagrams.",
    difficulty: "advanced",
    estimatedHours: 14,
    priority: "medium",
    status: "in-progress",
    progress: 25,
    dueIn: 21,
    createdDaysAgo: 22,
    tags: ["patterns", "php", "oop"],
    subtasks: ["Strategy", "Repository (and when not to)", "Decorator", "Factory & builder"],
  },

  /* ---------------------------- Frontend --------------------------- */
  {
    categoryId: "frontend",
    title: "React Hooks",
    description:
      "useEffect as a synchronisation tool, not a lifecycle. Custom hooks, refs, and the rules that keep renders honest.",
    difficulty: "intermediate",
    estimatedHours: 12,
    priority: "high",
    status: "completed",
    progress: 100,
    dueIn: -11,
    createdDaysAgo: 44,
    tags: ["react", "hooks"],
    subtasks: ["useEffect mental model", "useMemo / useCallback", "Custom hooks", "useReducer"],
    resources: [{ label: "react.dev", url: "https://react.dev/reference/react" }],
  },
  {
    categoryId: "frontend",
    title: "TypeScript",
    description:
      "Generics, conditional and mapped types, discriminated unions, and typing the boundary between server and client.",
    difficulty: "advanced",
    estimatedHours: 20,
    priority: "critical",
    status: "in-progress",
    progress: 55,
    dueIn: 6,
    createdDaysAgo: 38,
    tags: ["typescript", "types"],
    subtasks: ["Generics", "Conditional types", "Discriminated unions", "Type-safe API layer"],
    resources: [{ label: "Total TypeScript", url: "https://www.totaltypescript.com" }],
  },
  {
    categoryId: "frontend",
    title: "Tailwind",
    description:
      "Design tokens over ad-hoc values, composition with cva, and keeping utility soup out of the codebase.",
    difficulty: "beginner",
    estimatedHours: 6,
    priority: "medium",
    status: "completed",
    progress: 100,
    dueIn: -18,
    createdDaysAgo: 36,
    tags: ["tailwind", "css", "design"],
    subtasks: ["Token-first theming", "cva variants", "Responsive strategy"],
  },
  {
    categoryId: "frontend",
    title: "Next.js",
    description:
      "App Router, server vs client components, streaming, caching layers and route handlers.",
    difficulty: "advanced",
    estimatedHours: 18,
    priority: "high",
    status: "in-progress",
    progress: 40,
    dueIn: 10,
    createdDaysAgo: 28,
    tags: ["nextjs", "ssr", "app-router"],
    subtasks: ["Server components", "Streaming & Suspense", "Caching semantics", "Server actions"],
    resources: [{ label: "Next.js Docs", url: "https://nextjs.org/docs" }],
  },

  /* ----------------------------- DevOps ---------------------------- */
  {
    categoryId: "devops",
    title: "Docker Basics",
    description:
      "Images vs containers, layer caching, multi-stage builds and a compose file the whole team can run.",
    difficulty: "beginner",
    estimatedHours: 10,
    priority: "high",
    status: "completed",
    progress: 100,
    dueIn: -3,
    createdDaysAgo: 32,
    tags: ["docker", "containers"],
    subtasks: ["Dockerfile layers", "Multi-stage builds", "docker compose", "Volumes & networks"],
    resources: [{ label: "Docker Docs", url: "https://docs.docker.com/get-started/" }],
  },
  {
    categoryId: "devops",
    title: "CI/CD",
    description:
      "Pipelines that gate merges: test, lint, typecheck, build, deploy — fast enough that nobody skips them.",
    difficulty: "intermediate",
    estimatedHours: 12,
    priority: "high",
    status: "in-progress",
    progress: 35,
    dueIn: 5,
    createdDaysAgo: 24,
    tags: ["ci", "cd", "automation"],
    subtasks: ["Pipeline stages", "Caching deps", "Zero-downtime deploy", "Rollback plan"],
  },
  {
    categoryId: "devops",
    title: "GitHub Actions",
    description:
      "Workflow syntax, matrix builds, reusable workflows, secrets and OIDC to cloud providers.",
    difficulty: "intermediate",
    estimatedHours: 8,
    priority: "medium",
    status: "not-started",
    progress: 0,
    dueIn: 14,
    createdDaysAgo: 16,
    tags: ["github", "ci"],
    subtasks: ["Workflow syntax", "Matrix strategy", "Reusable workflows", "OIDC auth"],
    resources: [{ label: "Actions Docs", url: "https://docs.github.com/actions" }],
  },
  {
    categoryId: "devops",
    title: "Redis",
    description:
      "Data structures beyond GET/SET, eviction policies, pub/sub, locks and using it as a queue backend.",
    difficulty: "intermediate",
    estimatedHours: 8,
    priority: "medium",
    status: "not-started",
    progress: 0,
    dueIn: 16,
    createdDaysAgo: 14,
    tags: ["redis", "cache", "performance"],
    subtasks: ["Core data types", "Eviction policies", "Distributed locks", "Pub/Sub"],
  },

  /* --------------------------- Databases --------------------------- */
  {
    categoryId: "databases",
    title: "Query Optimisation & Indexing",
    description:
      "Read an EXPLAIN plan, choose composite index order, and kill N+1 before it reaches production.",
    difficulty: "advanced",
    estimatedHours: 14,
    priority: "high",
    status: "in-progress",
    progress: 20,
    dueIn: 11,
    createdDaysAgo: 21,
    tags: ["sql", "mysql", "performance"],
    subtasks: ["EXPLAIN plans", "Composite indexes", "N+1 detection", "Slow query log"],
  },
  {
    categoryId: "databases",
    title: "Database Design & Normalisation",
    description:
      "Normal forms, when to denormalise on purpose, and migrations that survive a live table.",
    difficulty: "intermediate",
    estimatedHours: 10,
    priority: "medium",
    status: "not-started",
    progress: 0,
    dueIn: 24,
    createdDaysAgo: 12,
    tags: ["schema", "modelling"],
    subtasks: ["Normal forms", "Deliberate denormalisation", "Zero-downtime migrations"],
  },
  {
    categoryId: "databases",
    title: "Transactions & Locking",
    description:
      "Isolation levels, deadlocks, optimistic vs pessimistic locking and where race conditions hide.",
    difficulty: "expert",
    estimatedHours: 8,
    priority: "medium",
    status: "not-started",
    progress: 0,
    dueIn: null,
    createdDaysAgo: 10,
    tags: ["acid", "concurrency"],
    subtasks: ["Isolation levels", "Deadlock debugging", "Optimistic locking"],
  },

  /* -------------------------- Architecture ------------------------- */
  {
    categoryId: "architecture",
    title: "SOLID Principles",
    description:
      "The five principles as refactoring tools — with the trade-offs each one costs you.",
    difficulty: "intermediate",
    estimatedHours: 10,
    priority: "high",
    status: "completed",
    progress: 100,
    dueIn: -8,
    createdDaysAgo: 42,
    tags: ["solid", "oop", "design"],
    subtasks: ["SRP", "OCP", "LSP", "ISP", "DIP"],
  },
  {
    categoryId: "architecture",
    title: "System Design",
    description:
      "Load balancing, caching layers, sharding, CAP trade-offs and defending a design out loud.",
    difficulty: "expert",
    estimatedHours: 30,
    priority: "critical",
    status: "in-progress",
    progress: 15,
    dueIn: 20,
    createdDaysAgo: 25,
    tags: ["system-design", "scalability"],
    subtasks: ["Load balancing", "Caching layers", "Sharding & replication", "CAP trade-offs", "Mock design round"],
    resources: [
      { label: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
    ],
  },
  {
    categoryId: "architecture",
    title: "Microservices Basics",
    description:
      "Service boundaries, sync vs async communication, the distributed monolith trap and when the monolith wins.",
    difficulty: "advanced",
    estimatedHours: 16,
    priority: "medium",
    status: "not-started",
    progress: 0,
    dueIn: 35,
    createdDaysAgo: 11,
    tags: ["microservices", "distributed"],
    subtasks: ["Bounded contexts", "Sync vs async", "Saga pattern", "Observability"],
  },

  /* -------------------------- Soft Skills -------------------------- */
  {
    categoryId: "soft-skills",
    title: "Technical Writing",
    description:
      "RFCs, ADRs and PR descriptions a reviewer can act on without a meeting.",
    difficulty: "beginner",
    estimatedHours: 6,
    priority: "medium",
    status: "in-progress",
    progress: 50,
    dueIn: 13,
    createdDaysAgo: 19,
    tags: ["writing", "communication"],
    subtasks: ["ADR template", "RFC structure", "Reviewable PR descriptions"],
  },
  {
    categoryId: "soft-skills",
    title: "Code Review Skills",
    description:
      "Review for correctness first, taste last. Give feedback that lands without bruising.",
    difficulty: "intermediate",
    estimatedHours: 4,
    priority: "medium",
    status: "not-started",
    progress: 0,
    dueIn: 26,
    createdDaysAgo: 9,
    tags: ["review", "collaboration"],
    subtasks: ["Severity triage", "Tone & framing", "Reviewing your own diff first"],
  },

  /* ----------------------------- Career ---------------------------- */
  {
    categoryId: "career",
    title: "Build Portfolio Projects",
    description:
      "Two deep projects that show judgement — architecture, tests, docs — instead of ten tutorial clones.",
    difficulty: "advanced",
    estimatedHours: 40,
    priority: "high",
    status: "in-progress",
    progress: 30,
    dueIn: 40,
    createdDaysAgo: 34,
    tags: ["portfolio", "projects"],
    subtasks: ["Pick two ideas", "Ship v1", "Write the README", "Add CI + tests"],
  },
  {
    categoryId: "career",
    title: "Open Source Contribution",
    description:
      "Find a repo you already use, fix a real issue, survive the review, get it merged.",
    difficulty: "intermediate",
    estimatedHours: 12,
    priority: "low",
    status: "not-started",
    progress: 0,
    dueIn: null,
    createdDaysAgo: 8,
    tags: ["oss", "community"],
    subtasks: ["Pick a repo", "Claim a good-first-issue", "Open the PR"],
  },

  /* ---------------------------- English ---------------------------- */
  {
    categoryId: "english",
    title: "English B2",
    description:
      "Reach confident B2: technical reading, meeting speaking, and writing without a translator tab open.",
    difficulty: "intermediate",
    estimatedHours: 60,
    priority: "high",
    status: "in-progress",
    progress: 60,
    dueIn: 45,
    createdDaysAgo: 60,
    tags: ["english", "b2", "communication"],
    subtasks: ["Daily listening", "Speaking practice", "Technical vocabulary", "Mock B2 exam"],
  },
  {
    categoryId: "english",
    title: "Technical Speaking Practice",
    description:
      "Explain your architecture out loud for 10 minutes with no notes. Record it. Watch it back.",
    difficulty: "intermediate",
    estimatedHours: 15,
    priority: "medium",
    status: "in-progress",
    progress: 20,
    dueIn: 28,
    createdDaysAgo: 13,
    tags: ["speaking", "english"],
    subtasks: ["Record 5 walkthroughs", "Shadowing drills", "Weekly conversation session"],
  },

  /* -------------------- Interview Preparation ---------------------- */
  {
    categoryId: "interview",
    title: "Practice LeetCode",
    description:
      "Patterns over volume: two pointers, sliding window, graphs, DP. 150 problems with real post-mortems.",
    difficulty: "advanced",
    estimatedHours: 50,
    priority: "critical",
    status: "in-progress",
    progress: 35,
    dueIn: 3,
    createdDaysAgo: 50,
    tags: ["algorithms", "leetcode", "dsa"],
    subtasks: ["Arrays & hashing", "Two pointers", "Sliding window", "Trees & graphs", "Dynamic programming"],
    resources: [{ label: "NeetCode 150", url: "https://neetcode.io/practice" }],
  },
  {
    categoryId: "interview",
    title: "Prepare Interview Questions",
    description:
      "STAR stories, a crisp intro, and honest answers for the questions you hope they don't ask.",
    difficulty: "beginner",
    estimatedHours: 8,
    priority: "high",
    status: "not-started",
    progress: 0,
    dueIn: 1,
    createdDaysAgo: 7,
    tags: ["behavioural", "star"],
    subtasks: ["10 STAR stories", "60-second intro", "Questions to ask them"],
  },
  {
    categoryId: "interview",
    title: "Mock Interviews",
    description:
      "Five live mocks under real pressure. The point is the feedback, not the pass.",
    difficulty: "advanced",
    estimatedHours: 10,
    priority: "medium",
    status: "not-started",
    progress: 0,
    dueIn: 32,
    createdDaysAgo: 6,
    tags: ["mock", "practice"],
    subtasks: ["2 coding mocks", "2 system design mocks", "1 behavioural mock"],
  },
];

/** Materialise seed tasks into fully-formed records with real dates and ids. */
export function createSeedTasks(): Task[] {
  const now = new Date();
  const perCategoryOrder = new Map<string, number>();

  return SEED_TASKS.map((seed) => {
    const order = perCategoryOrder.get(seed.categoryId) ?? 0;
    perCategoryOrder.set(seed.categoryId, order + 1);

    const createdAt = toISODate(addDays(now, -seed.createdDaysAgo));
    const { dueIn, createdDaysAgo, subtasks = [], resources = [], ...rest } = seed;

    // A completed task's subtasks are all done; otherwise mirror `progress` so
    // the checklist and the bar never contradict each other on first load.
    const doneCount =
      rest.status === "completed"
        ? subtasks.length
        : Math.round((rest.progress / 100) * subtasks.length);

    return {
      ...rest,
      id: uid("task"),
      order,
      createdAt,
      completedAt:
        rest.status === "completed" ? toISODate(addDays(now, -(dueIn ? Math.abs(dueIn) : 2))) : null,
      deadline: dueIn === null ? null : toISODate(addDays(now, dueIn)),
      subtasks: subtasks.map((title, i) => ({
        id: uid("sub"),
        title,
        done: i < doneCount,
      })),
      resources,
    } satisfies Task;
  });
}

/**
 * 90 days of plausible activity. Weekends are lighter, and the most recent
 * stretch is unbroken so the streak card has something to celebrate.
 */
export function createSeedActivity(): ActivityDay[] {
  const days: ActivityDay[] = [];
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = addDays(now, -i);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;

    // Deterministic pseudo-random so the chart doesn't reshuffle on every
    // render — the seed is the day index itself.
    const wobble = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const r = Math.abs(wobble);

    // Keep the last 9 days active to build a visible streak.
    const forceActive = i < 9;
    const idle = !forceActive && (isWeekend ? r < 0.45 : r < 0.12);

    const tasksCompleted = idle ? 0 : Math.max(1, Math.round(r * (isWeekend ? 2 : 4)));
    const hoursLogged = idle
      ? 0
      : Number((0.75 + r * (isWeekend ? 2 : 4.5)).toFixed(1));

    days.push({ date: toISODate(date), tasksCompleted, hoursLogged });
  }

  return days;
}

export function createSeedNotes(): Note[] {
  const now = new Date();
  return [
    {
      id: uid("note"),
      title: "Queue worker gotcha",
      body: "Workers boot the app once and hold it in memory — a deployed code change is invisible until `queue:restart`. Add it to the deploy script.",
      categoryId: "backend",
      pinned: true,
      updatedAt: toISODate(addDays(now, -1)),
    },
    {
      id: uid("note"),
      title: "Index order matters",
      body: "A composite index on (a, b) serves `WHERE a` and `WHERE a AND b`, but not `WHERE b` alone. Leftmost prefix rule — check EXPLAIN before adding another index.",
      categoryId: "databases",
      pinned: true,
      updatedAt: toISODate(addDays(now, -3)),
    },
    {
      id: uid("note"),
      title: "useEffect is not a lifecycle",
      body: "If an effect only computes a value from props/state, it should be a plain calculation during render. Effects are for syncing with systems outside React.",
      categoryId: "frontend",
      pinned: false,
      updatedAt: toISODate(addDays(now, -5)),
    },
    {
      id: uid("note"),
      title: "System design: always ask about scale first",
      body: "Requests/sec, read:write ratio, and data size change every downstream decision. Ask before drawing a single box.",
      categoryId: "architecture",
      pinned: false,
      updatedAt: toISODate(addDays(now, -8)),
    },
  ];
}

export const DEFAULT_PROFILE: UserProfile = {
  name: "Ahmed",
  role: "Backend Engineer",
  avatarUrl: null,
  dailyGoal: 3,
};
