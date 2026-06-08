# Interview Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public `/interview` page for the personal website that turns the owner's private question data into a structured interview practice workflow with category/topic/level filtering, search, accordion answers, flashcards, local learned/bookmark state, and a future owner-only auth path.

**Architecture:** Add a focused `interview-practice` feature boundary under `src/features` and keep route code thin in `src/app/interview/page.tsx`. Data is validated and queried through a server-only repository, then passed to small UI components as typed DTOs. Client components are limited to interaction-heavy pieces: local learning state, copy actions, accordion state, and flashcards.

**Tech Stack:** Next.js App Router 16.1.1, React 19, TypeScript, Tailwind CSS 4, shadcn/Radix primitives and selected registry primitives, Magic UI `BlurFade` plus `NumberTicker`, `AnimatedGridPattern`, `BorderBeam`, SVGL technology logo components, `react-markdown`, `remark-gfm`, Zod, browser `localStorage`.

---

## 1. Scope Lock

Implement the personal/internal MVP from `docs/superpowers/specs/2026-06-08-interview-practice-design.vi.md`.

Build:

- `/interview`
- nav dock item next to Blog
- feature-owned data boundary
- `Next.js` default category
- `lang=vi|en`
- category, subcategory, level and text search
- grouped category sidebar with technology logos/icons, counts, active highlight and configured `NEW` badges
- single-open accordion answer list
- markdown answer rendering with inline code
- level badges
- flashcard mode
- local learned/bookmark state
- copy question/share URL action
- final UX fidelity pass against the reference learning workflow

Do not build:

- pricing, paywall, subscription, checkout or monetization
- multi-user account system
- public user avatar/profile
- settings page
- global command palette
- database
- owner studio CRUD
- dedicated question detail route

## 2. Target File Structure

Create:

```text
src/app/interview/page.tsx
src/features/interview-practice/components/category-nav.tsx
src/features/interview-practice/components/flashcard-deck.tsx
src/features/interview-practice/components/interview-markdown.tsx
src/features/interview-practice/components/interview-practice-page.tsx
src/features/interview-practice/components/local-learning-state.tsx
src/features/interview-practice/components/progress-summary.tsx
src/features/interview-practice/components/question-filters.tsx
src/features/interview-practice/components/question-list.tsx
src/features/interview-practice/components/tech-icon.tsx
src/features/interview-practice/data/questions.json
src/features/interview-practice/lib/category-meta.ts
src/features/interview-practice/lib/question-filters.ts
src/features/interview-practice/lib/question-repository.ts
src/features/interview-practice/lib/question-schema.ts
src/features/interview-practice/lib/question-url-state.ts
src/features/interview-practice/types.ts
```

Modify:

```text
package.json
pnpm-lock.yaml
src/data/resume.tsx
```

Move:

```text
data.json -> src/features/interview-practice/data/questions.json
```

Do not edit unrelated dirty worktree changes.

## 3. Data Contracts

### Task 0: Add Server-Only Marker Dependency

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Install `server-only`**

Run:

```bash
pnpm add server-only
```

Expected: `package.json` includes `server-only` under `dependencies`, and `pnpm-lock.yaml` updates.

- [ ] **Step 2: Verify the package resolves**

Run:

```bash
node -e "console.log(require.resolve('server-only'))"
```

Expected: command prints a path inside `node_modules/server-only`.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

### Task 0A: Install Polished UI Registry Components

**Files:**

- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/scroll-area.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/progress.tsx`
- Create: `src/components/ui/number-ticker.tsx`
- Create: `src/components/ui/animated-grid-pattern.tsx`
- Create: `src/components/ui/border-beam.tsx`
- Create: selected `src/components/ui/svgs/*.tsx`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add shadcn primitives for polished filters and progress**

Run:

```bash
pnpm dlx shadcn@latest add @shadcn/tabs @shadcn/input @shadcn/scroll-area @shadcn/select @shadcn/progress -y
```

Expected: creates:

```text
src/components/ui/tabs.tsx
src/components/ui/input.tsx
src/components/ui/scroll-area.tsx
src/components/ui/select.tsx
src/components/ui/progress.tsx
```

Expected dependencies added by the CLI:

```text
@radix-ui/react-tabs
@radix-ui/react-scroll-area
@radix-ui/react-select
@radix-ui/react-progress
```

- [ ] **Step 2: Add Magic UI polish components**

Run:

```bash
pnpm dlx shadcn@latest add "https://magicui.design/r/number-ticker.json" "https://magicui.design/r/animated-grid-pattern.json" "https://magicui.design/r/border-beam.json" -y
```

Expected: creates:

```text
src/components/ui/number-ticker.tsx
src/components/ui/animated-grid-pattern.tsx
src/components/ui/border-beam.tsx
```

Expected: `motion` remains installed or is added if missing.

- [ ] **Step 3: Add SVGL frontend technology logos**

Run:

```bash
pnpm dlx shadcn@latest add @svgl/html5 @svgl/css @svgl/javascript @svgl/typescript @svgl/react @svgl/nextjs -y
```

Expected from dry-run:

```text
src/components/ui/svgs/html5.tsx
src/components/ui/svgs/cssOld.tsx
src/components/ui/svgs/javascript.tsx
```

Expected: existing TypeScript, React and Next.js icon files may be skipped as identical.

- [ ] **Step 4: Add SVGL backend/framework technology logos**

Run:

```bash
pnpm dlx shadcn@latest add @svgl/vue @svgl/angular @svgl/nodejs @svgl/nestjs @svgl/python @svgl/fastapi @svgl/django @svgl/java @svgl/postgresql @svgl/mongodb @svgl/docker @svgl/redis -y
```

Expected from dry-run:

```text
src/components/ui/svgs/vue.tsx
src/components/ui/svgs/angular.tsx
src/components/ui/svgs/nestjs.tsx
src/components/ui/svgs/fastapi.tsx
src/components/ui/svgs/django.tsx
src/components/ui/svgs/mongodbIconLight.tsx
src/components/ui/svgs/mongodbIconDark.tsx
src/components/ui/svgs/mongodbWordmarkLight.tsx
src/components/ui/svgs/mongodbWordmarkDark.tsx
src/components/ui/svgs/redis.tsx
```

Expected: existing Node.js, Python, Java, PostgreSQL and Docker icon files may be skipped as identical.

Do not add `@svgl/go`: dry-run shows it would overwrite `src/components/ui/svgs/golang.tsx`. Use the existing `Golang`/`GolangDark` project icon files instead.

- [ ] **Step 5: Verify generated files**

Run:

```bash
test -f src/components/ui/input.tsx
test -f src/components/ui/tabs.tsx
test -f src/components/ui/scroll-area.tsx
test -f src/components/ui/select.tsx
test -f src/components/ui/progress.tsx
test -f src/components/ui/number-ticker.tsx
test -f src/components/ui/animated-grid-pattern.tsx
test -f src/components/ui/border-beam.tsx
test -f src/components/ui/svgs/html5.tsx
test -f src/components/ui/svgs/javascript.tsx
test -f src/components/ui/svgs/vue.tsx
test -f src/components/ui/svgs/angular.tsx
test -f src/components/ui/svgs/nestjs.tsx
test -f src/components/ui/svgs/fastapi.tsx
test -f src/components/ui/svgs/django.tsx
test -f src/components/ui/svgs/redis.tsx
```

Expected: every command exits with status `0`.

- [ ] **Step 6: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

### Task 1: Move Data Into The Feature Boundary

**Files:**

- Move: `data.json`
- Create target: `src/features/interview-practice/data/questions.json`

- [ ] **Step 1: Create the feature data directory**

Run:

```bash
mkdir -p src/features/interview-practice/data
```

Expected: command exits with status `0`.

- [ ] **Step 2: Move the question data**

Run:

```bash
mv data.json src/features/interview-practice/data/questions.json
```

Expected: root `data.json` no longer exists and `src/features/interview-practice/data/questions.json` exists.

- [ ] **Step 3: Verify the JSON still parses**

Run:

```bash
node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('src/features/interview-practice/data/questions.json','utf8')); console.log(data.length)"
```

Expected output:

```text
2389
```

- [ ] **Step 4: Checkpoint**

Run:

```bash
git status --short src/features/interview-practice/data/questions.json data.json
```

Expected: the new JSON file is shown as untracked or added, and root `data.json` is removed from the working tree if it was tracked.

### Task 2: Add Types And Zod Validation

**Files:**

- Create: `src/features/interview-practice/types.ts`
- Create: `src/features/interview-practice/lib/question-schema.ts`

- [ ] **Step 1: Create `types.ts`**

Add:

```ts
export const INTERVIEW_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const INTERVIEW_LOCALES = ["vi", "en"] as const;
export const INTERVIEW_MODES = ["list", "flashcards"] as const;

export type InterviewLevel = (typeof INTERVIEW_LEVELS)[number];
export type InterviewLocale = (typeof INTERVIEW_LOCALES)[number];
export type InterviewMode = (typeof INTERVIEW_MODES)[number];

export type InterviewLevelFilter = InterviewLevel | "all";
export type InterviewSubcategoryFilter = string | "all";

export type InterviewQuestionRaw = {
  id: number;
  category: string;
  subcategory: string;
  level: InterviewLevel;
  q: string;
  a: string;
  q_en: string;
  a_en: string;
};

export type InterviewQuestionView = {
  id: number;
  category: string;
  subcategory: string;
  level: InterviewLevel;
  question: string;
  answer: string;
};

export type InterviewCategorySummary = {
  name: string;
  count: number;
};

export type InterviewSubcategorySummary = {
  name: string;
  count: number;
};

export type InterviewFilterState = {
  category: string;
  subcategory: InterviewSubcategoryFilter;
  level: InterviewLevelFilter;
  query: string;
  locale: InterviewLocale;
  mode: InterviewMode;
};
```

- [ ] **Step 2: Create `question-schema.ts`**

Add:

```ts
import { z } from "zod";

import { INTERVIEW_LEVELS } from "../types";

export const interviewQuestionRawSchema = z.object({
  id: z.number().int().positive(),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  level: z.enum(INTERVIEW_LEVELS),
  q: z.string().min(1),
  a: z.string().min(1),
  q_en: z.string().min(1),
  a_en: z.string().min(1),
});

export const interviewQuestionRawListSchema = z.array(
  interviewQuestionRawSchema
);
```

- [ ] **Step 3: Run type/lint gate**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

### Task 3: Add URL State Helpers

**Files:**

- Create: `src/features/interview-practice/lib/question-url-state.ts`

- [ ] **Step 1: Create URL helper module**

Add:

```ts
import {
  INTERVIEW_LEVELS,
  INTERVIEW_LOCALES,
  INTERVIEW_MODES,
  type InterviewFilterState,
  type InterviewLevelFilter,
  type InterviewLocale,
  type InterviewMode,
  type InterviewSubcategoryFilter,
} from "../types";

export const DEFAULT_INTERVIEW_CATEGORY = "Next.js";
export const DEFAULT_INTERVIEW_LOCALE: InterviewLocale = "vi";
export const DEFAULT_INTERVIEW_MODE: InterviewMode = "list";

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeLevel(value: string | undefined): InterviewLevelFilter {
  if (value === "all" || !value) {
    return "all";
  }

  return INTERVIEW_LEVELS.includes(value as (typeof INTERVIEW_LEVELS)[number])
    ? (value as InterviewLevelFilter)
    : "all";
}

function normalizeLocale(value: string | undefined): InterviewLocale {
  return INTERVIEW_LOCALES.includes(value as InterviewLocale)
    ? (value as InterviewLocale)
    : DEFAULT_INTERVIEW_LOCALE;
}

function normalizeMode(value: string | undefined): InterviewMode {
  return INTERVIEW_MODES.includes(value as InterviewMode)
    ? (value as InterviewMode)
    : DEFAULT_INTERVIEW_MODE;
}

function normalizeSubcategory(value: string | undefined): InterviewSubcategoryFilter {
  return value && value.trim().length > 0 ? value.trim() : "all";
}

export function parseInterviewSearchParams(
  searchParams: RawSearchParams
): InterviewFilterState {
  return {
    category:
      firstParam(searchParams.category)?.trim() || DEFAULT_INTERVIEW_CATEGORY,
    subcategory: normalizeSubcategory(firstParam(searchParams.subcategory)),
    level: normalizeLevel(firstParam(searchParams.level)),
    query: firstParam(searchParams.q)?.trim() || "",
    locale: normalizeLocale(firstParam(searchParams.lang)),
    mode: normalizeMode(firstParam(searchParams.mode)),
  };
}

export function createInterviewHref(
  nextState: Partial<InterviewFilterState>,
  currentState: InterviewFilterState
) {
  const state = { ...currentState, ...nextState };
  const params = new URLSearchParams();

  params.set("category", state.category);

  if (state.subcategory !== "all") {
    params.set("subcategory", state.subcategory);
  }

  if (state.level !== "all") {
    params.set("level", state.level);
  }

  if (state.query) {
    params.set("q", state.query);
  }

  if (state.locale !== DEFAULT_INTERVIEW_LOCALE) {
    params.set("lang", state.locale);
  }

  if (state.mode !== DEFAULT_INTERVIEW_MODE) {
    params.set("mode", state.mode);
  }

  return `/interview?${params.toString()}`;
}
```

- [ ] **Step 2: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

### Task 4: Add Server-Only Repository And Filters

**Files:**

- Create: `src/features/interview-practice/lib/question-repository.ts`
- Create: `src/features/interview-practice/lib/question-filters.ts`

- [ ] **Step 1: Create `question-repository.ts`**

Add:

```ts
import "server-only";

import rawQuestions from "../data/questions.json";
import type {
  InterviewCategorySummary,
  InterviewFilterState,
  InterviewLocale,
  InterviewQuestionRaw,
  InterviewQuestionView,
  InterviewSubcategorySummary,
} from "../types";
import { interviewQuestionRawListSchema } from "./question-schema";

const questions = interviewQuestionRawListSchema.parse(
  rawQuestions
) satisfies InterviewQuestionRaw[];

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function toQuestionView(
  question: InterviewQuestionRaw,
  locale: InterviewLocale
): InterviewQuestionView {
  return {
    id: question.id,
    category: question.category,
    subcategory: question.subcategory,
    level: question.level,
    question: locale === "en" ? question.q_en : question.q,
    answer: locale === "en" ? question.a_en : question.a,
  };
}

export function getInterviewQuestions() {
  return questions;
}

export function getInterviewQuestionTotal() {
  return questions.length;
}

export function getInterviewCategories(): InterviewCategorySummary[] {
  const counts = new Map<string, number>();

  for (const question of questions) {
    counts.set(question.category, (counts.get(question.category) ?? 0) + 1);
  }

  return sortByName(
    Array.from(counts, ([name, count]) => ({
      name,
      count,
    }))
  );
}

export function getInterviewSubcategories(
  category: string
): InterviewSubcategorySummary[] {
  const counts = new Map<string, number>();

  for (const question of questions) {
    if (question.category !== category) {
      continue;
    }

    counts.set(
      question.subcategory,
      (counts.get(question.subcategory) ?? 0) + 1
    );
  }

  return sortByName(
    Array.from(counts, ([name, count]) => ({
      name,
      count,
    }))
  );
}

export function getFilteredInterviewQuestions(state: InterviewFilterState) {
  const normalizedQuery = state.query.toLowerCase();

  return questions
    .filter((question) => question.category === state.category)
    .filter((question) =>
      state.subcategory === "all"
        ? true
        : question.subcategory === state.subcategory
    )
    .filter((question) =>
      state.level === "all" ? true : question.level === state.level
    )
    .filter((question) => {
      if (!normalizedQuery) {
        return true;
      }

      const localizedQuestion = state.locale === "en" ? question.q_en : question.q;
      const localizedAnswer = state.locale === "en" ? question.a_en : question.a;

      return `${localizedQuestion} ${localizedAnswer}`
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .map((question) => toQuestionView(question, state.locale));
}
```

- [ ] **Step 2: Create `question-filters.ts`**

Add:

```ts
import type {
  InterviewCategorySummary,
  InterviewFilterState,
  InterviewSubcategorySummary,
} from "../types";

export function resolveExistingCategory(
  categories: InterviewCategorySummary[],
  requestedCategory: string
) {
  return (
    categories.find((category) => category.name === requestedCategory)?.name ??
    categories[0]?.name ??
    requestedCategory
  );
}

export function resolveExistingSubcategory(
  subcategories: InterviewSubcategorySummary[],
  requestedSubcategory: InterviewFilterState["subcategory"]
) {
  if (requestedSubcategory === "all") {
    return "all";
  }

  return subcategories.some(
    (subcategory) => subcategory.name === requestedSubcategory
  )
    ? requestedSubcategory
    : "all";
}

export function withResolvedTaxonomy(
  state: InterviewFilterState,
  categories: InterviewCategorySummary[],
  subcategories: InterviewSubcategorySummary[]
): InterviewFilterState {
  return {
    ...state,
    category: resolveExistingCategory(categories, state.category),
    subcategory: resolveExistingSubcategory(
      subcategories,
      state.subcategory
    ),
  };
}
```

- [ ] **Step 3: Verify repository can load data**

Run:

```bash
pnpm build
```

Expected: build reaches compilation without JSON parsing errors. If unrelated existing worktree changes fail the build, capture the failure and do not edit unrelated files.

## 4. Route And Navigation

### Task 4A: Add Category Metadata And Tech Icon Registry

**Files:**

- Create: `src/features/interview-practice/lib/category-meta.ts`
- Create: `src/features/interview-practice/components/tech-icon.tsx`

- [ ] **Step 1: Create category metadata**

Add `src/features/interview-practice/lib/category-meta.ts`:

```ts
export type InterviewCategoryGroup =
  | "Frontend"
  | "Backend"
  | "Mobile"
  | "Data"
  | "DevOps"
  | "Computer Science"
  | "Career"
  | "Other";

export type InterviewIconKey =
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "react"
  | "nextjs"
  | "vue"
  | "angular"
  | "state"
  | "nodejs"
  | "nestjs"
  | "python"
  | "fastapi"
  | "django"
  | "go"
  | "java"
  | "php"
  | "laravel"
  | "csharp"
  | "ruby"
  | "rails"
  | "postgresql"
  | "mongodb"
  | "redis"
  | "docker"
  | "aws"
  | "android"
  | "flutter"
  | "react-native"
  | "security"
  | "testing"
  | "git"
  | "system"
  | "career"
  | "default";

export type InterviewCategoryMeta = {
  group: InterviewCategoryGroup;
  iconKey: InterviewIconKey;
  isNew?: boolean;
};

export const INTERVIEW_CATEGORY_META: Record<string, InterviewCategoryMeta> = {
  HTML: { group: "Frontend", iconKey: "html" },
  CSS: { group: "Frontend", iconKey: "css" },
  JavaScript: { group: "Frontend", iconKey: "javascript" },
  TypeScript: { group: "Frontend", iconKey: "typescript" },
  React: { group: "Frontend", iconKey: "react" },
  "Next.js": { group: "Frontend", iconKey: "nextjs" },
  "Vue.js": { group: "Frontend", iconKey: "vue" },
  Angular: { group: "Frontend", iconKey: "angular", isNew: true },
  "State Management": { group: "Frontend", iconKey: "state" },
  "Node.js": { group: "Backend", iconKey: "nodejs" },
  NestJS: { group: "Backend", iconKey: "nestjs" },
  Python: { group: "Backend", iconKey: "python" },
  FastAPI: { group: "Backend", iconKey: "fastapi", isNew: true },
  Django: { group: "Backend", iconKey: "django", isNew: true },
  Golang: { group: "Backend", iconKey: "go" },
  Java: { group: "Backend", iconKey: "java" },
  PHP: { group: "Backend", iconKey: "php" },
  Laravel: { group: "Backend", iconKey: "laravel" },
  "C#": { group: "Backend", iconKey: "csharp" },
  Ruby: { group: "Backend", iconKey: "ruby", isNew: true },
  Rails: { group: "Backend", iconKey: "rails", isNew: true },
  PostgreSQL: { group: "Data", iconKey: "postgresql" },
  MongoDB: { group: "Data", iconKey: "mongodb" },
  Redis: { group: "Data", iconKey: "redis" },
  Database: { group: "Data", iconKey: "postgresql" },
  "Docker & Kubernetes": { group: "DevOps", iconKey: "docker" },
  "AWS & Cloud": { group: "DevOps", iconKey: "aws" },
  "CI/CD": { group: "DevOps", iconKey: "git" },
  Android: { group: "Mobile", iconKey: "android" },
  Flutter: { group: "Mobile", iconKey: "flutter" },
  "React Native": { group: "Mobile", iconKey: "react-native" },
  "Operating System": { group: "Computer Science", iconKey: "system" },
  Network: { group: "Computer Science", iconKey: "system" },
  DSA: { group: "Computer Science", iconKey: "system" },
  "System Design": { group: "Computer Science", iconKey: "system" },
  Security: { group: "Computer Science", iconKey: "security" },
  Testing: { group: "Other", iconKey: "testing" },
  Git: { group: "Other", iconKey: "git" },
  "Career & Non-Tech": { group: "Career", iconKey: "career" },
};

export const INTERVIEW_CATEGORY_GROUP_ORDER: InterviewCategoryGroup[] = [
  "Frontend",
  "Backend",
  "Mobile",
  "Data",
  "DevOps",
  "Computer Science",
  "Career",
  "Other",
];

export function getInterviewCategoryMeta(category: string): InterviewCategoryMeta {
  return (
    INTERVIEW_CATEGORY_META[category] ?? {
      group: "Other",
      iconKey: "default",
    }
  );
}
```

- [ ] **Step 2: Create `TechIcon` resolver**

Add `src/features/interview-practice/components/tech-icon.tsx`:

```tsx
import type { ComponentType, SVGProps } from "react";
import {
  BookOpen,
  Boxes,
  BrainCircuit,
  BriefcaseBusiness,
  Cloud,
  Code2,
  Database,
  FileCode2,
  GitBranch,
  Layers3,
  MonitorCog,
  Network,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  TestTube2,
} from "lucide-react";

import { Angular } from "@/components/ui/svgs/angular";
import { Csharp } from "@/components/ui/svgs/csharp";
import { CssOld } from "@/components/ui/svgs/cssOld";
import { Django } from "@/components/ui/svgs/django";
import { Docker } from "@/components/ui/svgs/docker";
import { Fastapi } from "@/components/ui/svgs/fastapi";
import { Golang } from "@/components/ui/svgs/golang";
import { Html5 } from "@/components/ui/svgs/html5";
import { Java } from "@/components/ui/svgs/java";
import { Javascript } from "@/components/ui/svgs/javascript";
import { MongodbIconLight } from "@/components/ui/svgs/mongodbIconLight";
import { Nestjs } from "@/components/ui/svgs/nestjs";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Python } from "@/components/ui/svgs/python";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { Redis } from "@/components/ui/svgs/redis";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Vue } from "@/components/ui/svgs/vue";
import { cn } from "@/lib/utils";

import type { InterviewIconKey } from "../lib/category-meta";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const iconRegistry: Partial<Record<InterviewIconKey, IconComponent>> = {
  html: Html5,
  css: CssOld,
  javascript: Javascript,
  typescript: Typescript,
  react: ReactLight,
  nextjs: NextjsIconDark,
  vue: Vue,
  angular: Angular,
  nodejs: Nodejs,
  nestjs: Nestjs,
  python: Python,
  fastapi: Fastapi,
  django: Django,
  go: Golang,
  java: Java,
  csharp: Csharp,
  postgresql: Postgresql,
  mongodb: MongodbIconLight,
  redis: Redis,
  docker: Docker,
};

const fallbackRegistry: Record<InterviewIconKey, IconComponent> = {
  html: FileCode2,
  css: FileCode2,
  javascript: Code2,
  typescript: Code2,
  react: Code2,
  nextjs: Code2,
  vue: Code2,
  angular: Code2,
  state: Layers3,
  nodejs: Code2,
  nestjs: Code2,
  python: Code2,
  fastapi: Code2,
  django: Code2,
  go: Code2,
  java: Code2,
  php: Code2,
  laravel: Code2,
  csharp: Code2,
  ruby: Code2,
  rails: Code2,
  postgresql: Database,
  mongodb: Database,
  redis: Database,
  docker: PackageCheck,
  aws: Cloud,
  android: Smartphone,
  flutter: Smartphone,
  "react-native": Smartphone,
  security: ShieldCheck,
  testing: TestTube2,
  git: GitBranch,
  system: MonitorCog,
  career: BriefcaseBusiness,
  default: BrainCircuit,
};

type TechIconProps = {
  iconKey: InterviewIconKey;
  className?: string;
};

export function TechIcon({ iconKey, className }: TechIconProps) {
  const Icon = iconRegistry[iconKey] ?? fallbackRegistry[iconKey] ?? BookOpen;

  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
      <Icon className={cn("size-4", className)} aria-hidden />
    </span>
  );
}
```

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`. If generated SVGL component export names differ from the dry-run names above, update only the imports in `tech-icon.tsx` to match the generated files.

### Task 5: Add The `/interview` Route

**Files:**

- Create: `src/app/interview/page.tsx`
- Create: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Create app route page**

Add:

```tsx
import type { Metadata } from "next";

import { InterviewPracticePage } from "@/features/interview-practice/components/interview-practice-page";
import {
  getFilteredInterviewQuestions,
  getInterviewCategories,
  getInterviewQuestionTotal,
  getInterviewSubcategories,
} from "@/features/interview-practice/lib/question-repository";
import { withResolvedTaxonomy } from "@/features/interview-practice/lib/question-filters";
import { parseInterviewSearchParams } from "@/features/interview-practice/lib/question-url-state";

export const metadata: Metadata = {
  title: "Interview Practice",
  description:
    "A personal interview practice question bank for software engineering topics.",
  openGraph: {
    title: "Interview Practice",
    description:
      "A personal interview practice question bank for software engineering topics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interview Practice",
    description:
      "A personal interview practice question bank for software engineering topics.",
  },
};

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawState = parseInterviewSearchParams(await searchParams);
  const categories = getInterviewCategories();
  const initialSubcategories = getInterviewSubcategories(rawState.category);
  const state = withResolvedTaxonomy(
    rawState,
    categories,
    initialSubcategories
  );
  const subcategories = getInterviewSubcategories(state.category);
  const questions = getFilteredInterviewQuestions(state);

  return (
    <InterviewPracticePage
      categories={categories}
      filterState={state}
      questions={questions}
      subcategories={subcategories}
      totalQuestions={getInterviewQuestionTotal()}
    />
  );
}
```

- [ ] **Step 2: Create initial page shell component**

Add:

```tsx
import BlurFade from "@/components/magicui/blur-fade";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

import type {
  InterviewCategorySummary,
  InterviewFilterState,
  InterviewQuestionView,
  InterviewSubcategorySummary,
} from "../types";

type InterviewPracticePageProps = {
  categories: InterviewCategorySummary[];
  filterState: InterviewFilterState;
  questions: InterviewQuestionView[];
  subcategories: InterviewSubcategorySummary[];
  totalQuestions: number;
};

export function InterviewPracticePage({
  categories,
  filterState,
  questions,
  subcategories,
  totalQuestions,
}: InterviewPracticePageProps) {
  return (
    <main className="relative left-1/2 flex w-screen max-w-5xl -translate-x-1/2 flex-col gap-6 px-6">
      <BlurFade delay={0.04}>
        <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-5 shadow-[0_0_10px_3px] shadow-primary/5 backdrop-blur">
          <AnimatedGridPattern
            numSquares={28}
            maxOpacity={0.08}
            duration={3}
            repeatDelay={1}
            className={cn(
              "inset-x-0 inset-y-[-40%] h-[180%] skew-y-12",
              "mask-[radial-gradient(500px_circle_at_top_right,white,transparent)]"
            )}
          />
          <div className="relative z-10">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Personal Interview Practice
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Interview Practice
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  A focused question bank for reviewing software engineering topics
                  from your own data.
                </p>
              </div>
              <div className="rounded-2xl border bg-background/80 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
                <span className="block text-2xl font-semibold tracking-tight text-foreground">
                  <NumberTicker value={totalQuestions} />
                </span>
                questions
              </div>
            </div>
          </div>
          <BorderBeam duration={8} size={180} />
        </section>
      </BlurFade>

      <section className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-2xl border bg-card/70 p-4 text-sm">
          <p className="mb-3 font-medium">Categories</p>
          <p className="text-muted-foreground">
            {categories.length} categories loaded.
          </p>
        </aside>
        <div className="rounded-2xl border bg-card/70 p-4">
          <p className="text-sm text-muted-foreground">
            {filterState.category} · {subcategories.length} topics ·{" "}
            {questions.length} visible questions
          </p>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Run build**

Run:

```bash
pnpm build
```

Expected: `/interview` route compiles.

### Task 6: Add Interview To The Dock Navigation

**Files:**

- Modify: `src/data/resume.tsx`

- [ ] **Step 1: Add an icon import**

Modify the lucide import to include `BrainCircuitIcon`:

```tsx
import { BrainCircuitIcon, HomeIcon, NotebookIcon } from "lucide-react";
```

- [ ] **Step 2: Add nav item next to Blog**

Modify `DATA.navbar`:

```tsx
navbar: [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/blog", icon: NotebookIcon, label: "Blog" },
  { href: "/interview", icon: BrainCircuitIcon, label: "Interview" },
],
```

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

## 5. Filter UI

### Task 7: Implement Category Navigation

**Files:**

- Create: `src/features/interview-practice/components/category-nav.tsx`
- Modify: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Create `category-nav.tsx`**

Add:

```tsx
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type {
  InterviewCategorySummary,
  InterviewFilterState,
} from "../types";
import {
  getInterviewCategoryMeta,
  INTERVIEW_CATEGORY_GROUP_ORDER,
  type InterviewCategoryGroup,
} from "../lib/category-meta";
import { createInterviewHref } from "../lib/question-url-state";
import { TechIcon } from "./tech-icon";

type CategoryNavProps = {
  categories: InterviewCategorySummary[];
  filterState: InterviewFilterState;
};

export function CategoryNav({ categories, filterState }: CategoryNavProps) {
  const groupedCategories = categories.reduce(
    (groups, category) => {
      const meta = getInterviewCategoryMeta(category.name);
      const group = groups.get(meta.group) ?? [];
      group.push(category);
      groups.set(meta.group, group);
      return groups;
    },
    new Map<InterviewCategoryGroup, InterviewCategorySummary[]>()
  );

  return (
    <ScrollArea className="h-[58vh] pr-3">
      <nav aria-label="Interview categories" className="flex flex-col gap-5">
        {INTERVIEW_CATEGORY_GROUP_ORDER.map((groupName) => {
          const groupCategories = groupedCategories.get(groupName);

          if (!groupCategories?.length) {
            return null;
          }

          return (
            <section key={groupName} className="space-y-2">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {groupName}
              </p>
              <div className="grid gap-1">
                {groupCategories.map((category) => {
                  const meta = getInterviewCategoryMeta(category.name);
                  const isActive = category.name === filterState.category;

                  return (
                    <Link
                      key={category.name}
                      href={createInterviewHref(
                        {
                          category: category.name,
                          subcategory: "all",
                        },
                        filterState
                      )}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl border px-2.5 py-2 text-sm transition-all",
                        isActive
                          ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <TechIcon iconKey={meta.iconKey} />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {category.name}
                      </span>
                      {meta.isNew ? (
                        <Badge
                          variant={isActive ? "secondary" : "outline"}
                          className="shrink-0 text-[10px]"
                        >
                          NEW
                        </Badge>
                      ) : null}
                      <Badge
                        variant={isActive ? "secondary" : "outline"}
                        className="shrink-0"
                      >
                        {category.count}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
```

- [ ] **Step 2: Render `CategoryNav` in page shell**

In `interview-practice-page.tsx`, import and replace the initial category summary:

```tsx
import { CategoryNav } from "./category-nav";
```

Use:

```tsx
<aside className="rounded-2xl border bg-card/70 p-4 text-sm">
  <div className="mb-3 flex items-center justify-between">
    <p className="font-medium">Categories</p>
    <span className="text-xs text-muted-foreground">
      {categories.length}
    </span>
  </div>
  <CategoryNav categories={categories} filterState={filterState} />
</aside>
```

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

### Task 8: Implement Topic, Level, Search, Mode, And Language Filters

**Files:**

- Create: `src/features/interview-practice/components/question-filters.tsx`
- Modify: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Create `question-filters.tsx`**

Add:

```tsx
import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type {
  InterviewFilterState,
  InterviewLevelFilter,
  InterviewSubcategorySummary,
} from "../types";
import { createInterviewHref } from "../lib/question-url-state";

const levelOptions: { label: string; value: InterviewLevelFilter }[] = [
  { label: "All", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

type QuestionFiltersProps = {
  filterState: InterviewFilterState;
  resultCount: number;
  subcategories: InterviewSubcategorySummary[];
};

export function QuestionFilters({
  filterState,
  resultCount,
  subcategories,
}: QuestionFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href={createInterviewHref({ subcategory: "all" }, filterState)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
            filterState.subcategory === "all"
              ? "border-primary/30 bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          All
          <Badge variant="secondary">{resultCount}</Badge>
        </Link>
        {subcategories.map((subcategory) => {
          const isActive = filterState.subcategory === subcategory.name;

          return (
            <Link
              key={subcategory.name}
              href={createInterviewHref(
                { subcategory: subcategory.name },
                filterState
              )}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "border-primary/30 bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {subcategory.name}
              <Badge variant="secondary">{subcategory.count}</Badge>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
        <form action="/interview" className="relative">
          <input type="hidden" name="category" value={filterState.category} />
          {filterState.subcategory !== "all" ? (
            <input
              type="hidden"
              name="subcategory"
              value={filterState.subcategory}
            />
          ) : null}
          {filterState.level !== "all" ? (
            <input type="hidden" name="level" value={filterState.level} />
          ) : null}
          {filterState.locale !== "vi" ? (
            <input type="hidden" name="lang" value={filterState.locale} />
          ) : null}
          {filterState.mode !== "list" ? (
            <input type="hidden" name="mode" value={filterState.mode} />
          ) : null}
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Search interview questions"
            className="h-9 rounded-xl pl-9"
            defaultValue={filterState.query}
            name="q"
            placeholder="Search questions..."
          />
        </form>

        <div className="flex flex-wrap gap-2">
          {levelOptions.map((level) => {
            const isActive = filterState.level === level.value;

            return (
              <Button key={level.value} asChild size="sm" variant={isActive ? "default" : "outline"}>
                <Link href={createInterviewHref({ level: level.value }, filterState)}>
                  {level.label}
                </Link>
              </Button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" variant={filterState.mode === "list" ? "default" : "outline"}>
            <Link href={createInterviewHref({ mode: "list" }, filterState)}>
              List
            </Link>
          </Button>
          <Button asChild size="sm" variant={filterState.mode === "flashcards" ? "default" : "outline"}>
            <Link href={createInterviewHref({ mode: "flashcards" }, filterState)}>
              Flashcards
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link
              href={createInterviewHref(
                { locale: filterState.locale === "vi" ? "en" : "vi" },
                filterState
              )}
            >
              {filterState.locale === "vi" ? "EN" : "VI"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Render filters in page shell**

Import:

```tsx
import { QuestionFilters } from "./question-filters";
```

Replace the initial main summary with:

```tsx
<div className="flex flex-col gap-4 rounded-2xl border bg-card/70 p-4">
  <div className="flex flex-col gap-1">
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      {filterState.category}
    </p>
    <h2 className="text-xl font-semibold tracking-tight">
      {questions.length.toLocaleString()} visible questions
    </h2>
  </div>
  <QuestionFilters
    filterState={filterState}
    resultCount={questions.length}
    subcategories={subcategories}
  />
</div>
```

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

## 6. Question List And Local State

### Task 9: Add Local Learning State Hook

**Files:**

- Create: `src/features/interview-practice/components/local-learning-state.tsx`

- [ ] **Step 1: Create local state hook**

Add:

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const LEARNED_STORAGE_KEY = "interview-practice:v1:learned";
const BOOKMARK_STORAGE_KEY = "interview-practice:v1:bookmarks";

function readNumberSet(key: string) {
  if (typeof window === "undefined") {
    return new Set<number>();
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue)) {
      return new Set<number>();
    }

    return new Set(
      parsedValue.filter((value): value is number => typeof value === "number")
    );
  } catch {
    return new Set<number>();
  }
}

function writeNumberSet(key: string, value: Set<number>) {
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(value)));
  } catch {
    return;
  }
}

export function useLocalLearningState() {
  const [isReady, setIsReady] = useState(false);
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLearnedIds(readNumberSet(LEARNED_STORAGE_KEY));
    setBookmarkedIds(readNumberSet(BOOKMARK_STORAGE_KEY));
    setIsReady(true);
  }, []);

  const toggleLearned = useCallback((id: number) => {
    setLearnedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }

      writeNumberSet(LEARNED_STORAGE_KEY, nextIds);
      return nextIds;
    });
  }, []);

  const toggleBookmark = useCallback((id: number) => {
    setBookmarkedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }

      writeNumberSet(BOOKMARK_STORAGE_KEY, nextIds);
      return nextIds;
    });
  }, []);

  return useMemo(
    () => ({
      bookmarkedIds,
      isReady,
      learnedIds,
      toggleBookmark,
      toggleLearned,
    }),
    [bookmarkedIds, isReady, learnedIds, toggleBookmark, toggleLearned]
  );
}
```

- [ ] **Step 2: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

### Task 10: Add Markdown Renderer

**Files:**

- Create: `src/features/interview-practice/components/interview-markdown.tsx`

- [ ] **Step 1: Create markdown renderer**

Add:

```tsx
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type InterviewMarkdownProps = {
  children: string;
  className?: string;
};

export function InterviewMarkdown({
  children,
  className,
}: InterviewMarkdownProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      className={cn(
        "prose prose-sm max-w-none text-muted-foreground dark:prose-invert prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground prose-pre:border prose-pre:bg-muted/60",
        className
      )}
    >
      {children}
    </Markdown>
  );
}
```

- [ ] **Step 2: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

### Task 11: Implement Question Accordion List

**Files:**

- Create: `src/features/interview-practice/components/question-list.tsx`
- Modify: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Create `question-list.tsx`**

Add:

```tsx
"use client";

import { Bookmark, CheckCircle2, Clipboard, LinkIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { InterviewQuestionView } from "../types";
import { InterviewMarkdown } from "./interview-markdown";
import { useLocalLearningState } from "./local-learning-state";

type QuestionListProps = {
  questions: InterviewQuestionView[];
};

function levelLabel(level: InterviewQuestionView["level"]) {
  const labels = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  } satisfies Record<InterviewQuestionView["level"], string>;

  return labels[level];
}

function levelClassName(level: InterviewQuestionView["level"]) {
  const classNames = {
    beginner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    advanced: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  } satisfies Record<InterviewQuestionView["level"], string>;

  return classNames[level];
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

function createQuestionShareUrl(questionId: number) {
  const shareUrl = new URL(window.location.href);
  shareUrl.hash = `question-${questionId}`;
  return shareUrl.toString();
}

export function QuestionList({ questions }: QuestionListProps) {
  const {
    bookmarkedIds,
    isReady,
    learnedIds,
    toggleBookmark,
    toggleLearned,
  } = useLocalLearningState();

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-background/60 p-8 text-center text-sm text-muted-foreground">
        No questions match the current filters.
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="grid gap-3">
      {questions.map((question, index) => {
        const isLearned = isReady && learnedIds.has(question.id);
        const isBookmarked = isReady && bookmarkedIds.has(question.id);
        return (
          <AccordionItem
            key={question.id}
            id={`question-${question.id}`}
            value={String(question.id)}
            className={cn(
              "rounded-2xl border bg-background/70 px-4",
              isLearned && "border-primary/20 bg-primary/5"
            )}
          >
            <AccordionTrigger className="gap-3 py-4 hover:no-underline [&>svg]:hidden">
              <div className="flex w-full min-w-0 flex-col gap-3 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <Badge variant="outline" className={levelClassName(question.level)}>
                    {levelLabel(question.level)}
                  </Badge>
                  <Badge variant="outline">{question.subcategory}</Badge>
                </div>
                <span className={cn("text-sm font-medium", isLearned && "text-muted-foreground line-through decoration-muted-foreground/50")}>
                  {question.question}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <InterviewMarkdown>{question.answer}</InterviewMarkdown>
              <div className="flex flex-wrap gap-2 border-t pt-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant={isLearned ? "default" : "outline"}
                      onClick={() => toggleLearned(question.id)}
                      aria-label={isLearned ? "Mark as not learned" : "Mark as learned"}
                    >
                      <CheckCircle2 className="mr-2 size-4" />
                      {isLearned ? "Learned" : "Mark learned"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Track your local progress</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant={isBookmarked ? "default" : "outline"}
                      onClick={() => toggleBookmark(question.id)}
                      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                    >
                      <Bookmark className="mr-2 size-4" />
                      {isBookmarked ? "Saved" : "Bookmark"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save this question locally</TooltipContent>
                </Tooltip>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => copyText(question.question)}
                >
                  <Clipboard className="mr-2 size-4" />
                  Copy
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => copyText(createQuestionShareUrl(question.id))}
                >
                  <LinkIcon className="mr-2 size-4" />
                  Link
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
```

- [ ] **Step 2: Render `QuestionList` when mode is list**

In `interview-practice-page.tsx`, import:

```tsx
import { QuestionList } from "./question-list";
```

After `QuestionFilters`, render:

```tsx
{filterState.mode === "list" ? <QuestionList questions={questions} /> : null}
```

- [ ] **Step 3: Run lint and build**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both commands exit with status `0`.

## 7. Flashcards

### Task 12: Implement Flashcard Deck

**Files:**

- Create: `src/features/interview-practice/components/flashcard-deck.tsx`
- Modify: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Create `flashcard-deck.tsx`**

Add:

```tsx
"use client";

import { useMemo, useState } from "react";
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { InterviewQuestionView } from "../types";
import { InterviewMarkdown } from "./interview-markdown";
import { useLocalLearningState } from "./local-learning-state";

type FlashcardDeckProps = {
  questions: InterviewQuestionView[];
};

export function FlashcardDeck({ questions }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const { bookmarkedIds, learnedIds, toggleBookmark, toggleLearned } =
    useLocalLearningState();

  const currentQuestion = questions[index];

  const progressLabel = useMemo(() => {
    if (questions.length === 0) {
      return "0 / 0";
    }

    return `${index + 1} / ${questions.length}`;
  }, [index, questions.length]);

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl border border-dashed bg-background/60 p-8 text-center text-sm text-muted-foreground">
        No flashcards match the current filters.
      </div>
    );
  }

  const isLearned = learnedIds.has(currentQuestion.id);
  const isBookmarked = bookmarkedIds.has(currentQuestion.id);

  function goToPrevious() {
    setIndex((currentIndex) => Math.max(currentIndex - 1, 0));
    setIsAnswerVisible(false);
  }

  function goToNext() {
    setIndex((currentIndex) =>
      Math.min(currentIndex + 1, questions.length - 1)
    );
    setIsAnswerVisible(false);
  }

  return (
    <Card className="border bg-background/70">
      <CardHeader className="gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{progressLabel}</span>
          <span>
            {currentQuestion.category} · {currentQuestion.subcategory} ·{" "}
            {currentQuestion.level}
          </span>
        </div>
        <CardTitle className="text-xl leading-snug">
          {currentQuestion.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5 pt-0">
        <div className="min-h-40 rounded-2xl border bg-card p-5">
          {isAnswerVisible ? (
            <InterviewMarkdown>{currentQuestion.answer}</InterviewMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">
              Think through your answer, then reveal it when ready.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevious}
            disabled={index === 0}
          >
            <ChevronLeft className="mr-2 size-4" />
            Previous
          </Button>
          <Button
            type="button"
            onClick={() => setIsAnswerVisible((currentValue) => !currentValue)}
          >
            <RotateCw className="mr-2 size-4" />
            {isAnswerVisible ? "Hide answer" : "Reveal answer"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goToNext}
            disabled={index === questions.length - 1}
          >
            Next
            <ChevronRight className="ml-2 size-4" />
          </Button>
          <Button
            type="button"
            variant={isLearned ? "default" : "outline"}
            onClick={() => toggleLearned(currentQuestion.id)}
          >
            <CheckCircle2 className="mr-2 size-4" />
            {isLearned ? "Learned" : "Mark learned"}
          </Button>
          <Button
            type="button"
            variant={isBookmarked ? "default" : "outline"}
            onClick={() => toggleBookmark(currentQuestion.id)}
          >
            <Bookmark className="mr-2 size-4" />
            {isBookmarked ? "Saved" : "Bookmark"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Render deck when mode is flashcards**

In `interview-practice-page.tsx`, import:

```tsx
import { FlashcardDeck } from "./flashcard-deck";
```

Render:

```tsx
{filterState.mode === "flashcards" ? (
  <FlashcardDeck questions={questions} />
) : null}
```

- [ ] **Step 3: Run lint and build**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both commands exit with status `0`.

## 8. Polish And Verification

### Task 12A: Add Local Progress Summary

**Files:**

- Create: `src/features/interview-practice/components/progress-summary.tsx`
- Modify: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Create `progress-summary.tsx`**

Add:

```tsx
"use client";

import { Bookmark, CheckCircle2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";

import type { InterviewQuestionView } from "../types";
import { useLocalLearningState } from "./local-learning-state";

type ProgressSummaryProps = {
  questions: InterviewQuestionView[];
};

export function ProgressSummary({ questions }: ProgressSummaryProps) {
  const { bookmarkedIds, isReady, learnedIds } = useLocalLearningState();

  const visibleIds = new Set(questions.map((question) => question.id));
  const learnedCount = isReady
    ? Array.from(learnedIds).filter((id) => visibleIds.has(id)).length
    : 0;
  const bookmarkedCount = isReady
    ? Array.from(bookmarkedIds).filter((id) => visibleIds.has(id)).length
    : 0;
  const progressValue =
    questions.length > 0 ? Math.round((learnedCount / questions.length) * 100) : 0;

  return (
    <div className="grid gap-3 rounded-2xl border bg-background/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Local progress</p>
          <p className="text-xs text-muted-foreground">
            Stored only in this browser for now.
          </p>
        </div>
        <span className="text-sm font-semibold">{progressValue}%</span>
      </div>
      <Progress value={progressValue} />
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="size-3.5" />
          {learnedCount} learned
        </span>
        <span className="inline-flex items-center gap-1">
          <Bookmark className="size-3.5" />
          {bookmarkedCount} bookmarked
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Render summary above the active mode**

In `interview-practice-page.tsx`, import:

```tsx
import { ProgressSummary } from "./progress-summary";
```

Render after `QuestionFilters`:

```tsx
<ProgressSummary questions={questions} />
```

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

### Task 13: Final Page Composition And Empty States

**Files:**

- Modify: `src/features/interview-practice/components/interview-practice-page.tsx`

- [ ] **Step 1: Ensure final page shell matches this composition**

Final `InterviewPracticePage` should render:

```tsx
import BlurFade from "@/components/magicui/blur-fade";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

import type {
  InterviewCategorySummary,
  InterviewFilterState,
  InterviewQuestionView,
  InterviewSubcategorySummary,
} from "../types";
import { CategoryNav } from "./category-nav";
import { FlashcardDeck } from "./flashcard-deck";
import { ProgressSummary } from "./progress-summary";
import { QuestionFilters } from "./question-filters";
import { QuestionList } from "./question-list";

type InterviewPracticePageProps = {
  categories: InterviewCategorySummary[];
  filterState: InterviewFilterState;
  questions: InterviewQuestionView[];
  subcategories: InterviewSubcategorySummary[];
  totalQuestions: number;
};

export function InterviewPracticePage({
  categories,
  filterState,
  questions,
  subcategories,
  totalQuestions,
}: InterviewPracticePageProps) {
  return (
    <main className="relative left-1/2 flex w-screen max-w-5xl -translate-x-1/2 flex-col gap-6 px-6">
      <BlurFade delay={0.04}>
        <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-5 shadow-[0_0_10px_3px] shadow-primary/5 backdrop-blur">
          <AnimatedGridPattern
            numSquares={28}
            maxOpacity={0.08}
            duration={3}
            repeatDelay={1}
            className={cn(
              "inset-x-0 inset-y-[-40%] h-[180%] skew-y-12",
              "mask-[radial-gradient(500px_circle_at_top_right,white,transparent)]"
            )}
          />
          <div className="relative z-10">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Personal Interview Practice
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Interview Practice
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  A focused question bank for reviewing software engineering topics
                  from your own data.
                </p>
              </div>
              <div className="rounded-2xl border bg-background/80 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
                <span className="block text-2xl font-semibold tracking-tight text-foreground">
                  <NumberTicker value={totalQuestions} />
                </span>
                questions
              </div>
            </div>
          </div>
          <BorderBeam duration={8} size={180} />
        </section>
      </BlurFade>

      <section className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="max-h-[70vh] overflow-y-auto rounded-2xl border bg-card/70 p-4 text-sm lg:sticky lg:top-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium">Categories</p>
            <span className="text-xs text-muted-foreground">
              {categories.length}
            </span>
          </div>
          <CategoryNav categories={categories} filterState={filterState} />
        </aside>

        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card/70 p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {filterState.category}
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              {questions.length.toLocaleString()} visible questions
            </h2>
          </div>
          <QuestionFilters
            filterState={filterState}
            resultCount={questions.length}
            subcategories={subcategories}
          />
          <ProgressSummary questions={questions} />
          {filterState.mode === "flashcards" ? (
            <FlashcardDeck questions={questions} />
          ) : (
            <QuestionList questions={questions} />
          )}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Run build**

Run:

```bash
pnpm build
```

Expected: command exits with status `0`.

### Task 14: UX Fidelity Pass

**Files:**

- Review and modify if a checklist item fails: `src/features/interview-practice/components/interview-practice-page.tsx`
- Review and modify if a checklist item fails: `src/features/interview-practice/components/category-nav.tsx`
- Review and modify if a checklist item fails: `src/features/interview-practice/components/question-filters.tsx`
- Review and modify if a checklist item fails: `src/features/interview-practice/components/question-list.tsx`
- Review and modify if a checklist item fails: `src/features/interview-practice/components/flashcard-deck.tsx`
- Review and modify if a checklist item fails: `src/features/interview-practice/components/tech-icon.tsx`

- [ ] **Step 1: Verify category sidebar fidelity**

Check the rendered `/interview` category area against this list:

```text
Frontend group visible.
Backend group visible.
Each category row has an icon/logo or stable fallback icon.
HTML, CSS, JavaScript, TypeScript, React, Next.js, Vue.js, Angular have logos.
Node.js, NestJS, Python, FastAPI, Django, Golang, Java have logos or project icons.
Active category is visually obvious.
Counts are aligned and readable.
Configured NEW categories show NEW badges.
The category list scrolls without pushing the whole page awkwardly.
```

Fix any missed item before moving on.

- [ ] **Step 2: Verify learning workflow fidelity**

Check:

```text
Topic filters show counts.
Difficulty badges have distinct color treatments and text labels.
Question cards have clear borders, spacing and metadata hierarchy.
Question actions use icons and tooltips.
Answer markdown renders inline code distinctly.
Learned state is visible.
Bookmark state is visible.
Flashcard mode feels like a card deck, not a plain text panel.
Language toggle is visible and understandable.
Dark mode keeps logos, cards and text readable.
```

Fix any missed item before moving on.

- [ ] **Step 3: Verify mobile polish**

Check at a narrow viewport:

```text
Header does not overflow.
Category navigation remains usable.
Topic chips wrap or scroll cleanly.
Search, level, mode and language controls are tappable.
Question action buttons wrap cleanly.
Flashcard controls wrap cleanly.
No horizontal page overflow.
```

Fix any missed item before moving on.

- [ ] **Step 4: Run lint and build**

Run:

```bash
pnpm lint
pnpm build
```

Expected: both commands exit with status `0`.

### Task 15: Browser QA

**Files:**

- No source file changes required unless QA exposes a bug.

- [ ] **Step 1: Start local dev server**

Run:

```bash
pnpm dev
```

Expected: Next.js dev server starts, usually at `http://localhost:3000`.

- [ ] **Step 2: Verify route manually or through Browser plugin**

Open:

```text
http://localhost:3000/interview
```

Expected:

- page loads without runtime error
- dock shows Interview next to Blog
- default category is `Next.js`
- category active state is visible
- category counts are visible
- category groups such as Frontend and Backend are visible
- technology logos/icons appear beside category names
- known logo-backed categories such as HTML, CSS, JavaScript, TypeScript, React, Next.js, Vue.js, Angular, Node.js, NestJS, Python, FastAPI, Django, Golang and Java do not render as blank icons
- configured `NEW` badges are visible
- subcategory chips show counts
- header uses animated count and subtle Magic UI atmosphere without distracting from reading
- local progress summary appears and updates after marking learned
- level buttons work
- search filters current category
- `lang=vi` renders Vietnamese content
- `lang=en` renders English content
- accordion opens exactly one answer at a time
- inline code has styled code formatting
- learned state changes button styling and survives reload
- bookmark state changes button styling and survives reload
- copy question does not throw
- flashcard mode reveals answer and navigates
- layout is usable at mobile width and desktop width

- [ ] **Step 3: Stop dev server**

Stop the server with `Ctrl+C`.

Expected: terminal returns to prompt.

### Task 16: Final Verification And Handoff

**Files:**

- Review all files created or modified by this implementation.

- [ ] **Step 1: Run lint**

Run:

```bash
pnpm lint
```

Expected: command exits with status `0`.

- [ ] **Step 2: Run production build**

Run:

```bash
pnpm build
```

Expected: command exits with status `0`.

- [ ] **Step 3: Confirm raw data is not in `public/`**

Run:

```bash
test ! -f public/data.json && test ! -f public/questions.json
```

Expected: command exits with status `0`.

- [ ] **Step 4: Confirm Client Components do not import raw JSON**

Run:

```bash
rg -n "questions\\.json|data\\.json" src/features/interview-practice/components src/app/interview
```

Expected: no matches in client components. Matches in `question-repository.ts` are allowed.

- [ ] **Step 5: Review changed files**

Run:

```bash
git status --short
git diff --stat
```

Expected: changed files match this plan. Existing unrelated dirty files may still appear; do not revert them.

## 9. Self-Review Checklist

Spec coverage:

- `/interview` route: Task 5.
- Dock nav item: Task 6.
- Server-only marker dependency: Task 0.
- Server-only data boundary: Task 4.
- Data validation: Task 2 and Task 4.
- Registry UI primitives and logos: Task 0A.
- Category metadata and icon registry: Task 4A.
- Category navigation/counts/icons/groups/NEW badges: Task 7 and Task 14.
- Subcategory/topic filters/counts: Task 8.
- Level filter: Task 8.
- Search: Task 8.
- Accordion answer list: Task 11.
- Markdown answer rendering: Task 10 and Task 11.
- Flashcards: Task 12.
- Local learned/bookmark: Task 9, Task 11 and Task 12.
- Copy action: Task 11.
- Language toggle: Task 8.
- Responsive/browser verification: Task 15.
- UX fidelity verification: Task 14.
- Final lint/build/data exposure checks: Task 16.

Out-of-scope features intentionally absent:

- pricing/paywall/subscription
- multi-user account system
- settings page
- global command palette
- question detail route
- database persistence
- owner studio CRUD
