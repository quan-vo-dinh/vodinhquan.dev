# Codebase Quality Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the release blockers and highest-risk correctness findings from the 2026-06-14 codebase audit without redesigning the public Interview UI.

**Architecture:** Deepen the learning-progress module around validated commands and canonical snapshots. Keep React responsible for presentation and optimistic interaction, keep Supabase behind typed server adapters, and enforce owner-only authorization in both the OAuth callback and Postgres RLS.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod, Supabase Auth/Postgres/RLS, Vitest 4, pnpm.

---

## File Map

- `src/features/interview-practice/lib/learning-progress.ts`: pure snapshot, merge, toggle, and validation rules.
- `src/features/interview-practice/lib/learning-state-types.ts`: public learning-state contracts.
- `src/features/interview-practice/actions/learning-state-actions.ts`: validated, typed Supabase commands.
- `src/features/interview-practice/lib/learning-state-repository.ts`: explicit anonymous/ready/unavailable read result.
- `src/features/interview-practice/components/interview-learning-state-provider.tsx`: optimistic state and mutation ordering only.
- `src/features/interview-practice/components/flashcard-deck.tsx`: valid card selection after filtered data changes.
- `src/features/auth/lib/auth-config.ts`: canonical application origin and owner identity.
- `src/features/auth/lib/auth-authorization.ts`: owner identity checks.
- `src/features/auth/lib/auth-redirect.ts`: safe redirect path and origin resolution.
- `src/app/auth/**/route.ts`: centralized redirect and owner-only flow.
- `src/lib/env.ts`: validated environment configuration.
- `src/lib/supabase/types.ts`: generated-style database and RPC typing.
- `supabase/migrations/202606140001_secure_learning_progress.sql`: additive sync RPC, constraints, and owner-only RLS.
- `vitest.config.ts` and colocated `*.test.ts`: unit and regression coverage.
- `.github/workflows/quality.yml`: lint, test, build, and production audit gate.

### Task 1: Establish The Test Gate

- [x] Add Vitest 4 and a Node-based test configuration with the `@/` alias.
- [x] Add `test` and `test:watch` scripts.
- [x] Add initial regression tests for learning-state merge semantics, command validation, pagination, auth redirects, and flashcard index normalization.
- [x] Run the focused tests and confirm they fail for the missing behavior.

### Task 2: Deepen Learning Progress

- [x] Implement pure additive merge and validation helpers.
- [x] Add canonical snapshot/result contracts.
- [x] Add a transactional Supabase RPC that never clears remote state absent from a local snapshot.
- [x] Replace `as any` writes with typed table/RPC calls.
- [x] Return the canonical merged snapshot after browser sync.
- [x] Run focused tests and confirm the merge regression is green.

### Task 3: Make Optimistic Updates Deterministic

- [x] Move persistence side effects outside React state updater callbacks.
- [x] Track mutation versions so stale failures cannot roll back newer intent.
- [x] Use the canonical sync response instead of a client-side union.
- [x] Surface persistence unavailability instead of presenting an empty successful account.
- [x] Run provider/domain tests and lint the touched modules.

### Task 4: Enforce Owner-Only Auth

- [x] Validate canonical app origin and owner GitHub username.
- [x] Centralize safe relative redirect handling.
- [x] Reject and sign out non-owner OAuth sessions after code exchange.
- [x] Add an owner-account table/function and require it in RLS policies.
- [x] Restrict the Supabase proxy matcher to auth and Interview paths.
- [x] Run auth utility tests and build.

### Task 5: Resolve Security And Small Correctness Findings

- [x] Upgrade `next` and `eslint-config-next` together to `16.2.9`.
- [x] Rename deprecated `middleware.ts`/`middleware` to `proxy.ts`/`proxy`.
- [x] Clamp flashcard selection when filters change.
- [x] Fix empty pagination normalization and deterministic blog sorting.
- [x] Remove confirmed dead exports/files/dependencies when no caller exists.
- [x] Run `pnpm audit --prod` and document any remaining transitive advisories.

### Task 6: Add Delivery Guardrails

- [x] Add CI for lint, tests, build, and production audit.
- [x] Enable low-risk TypeScript strictness flags that pass the codebase.
- [x] Run `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm audit --prod`.
- [x] Re-sync CodeGraph and inspect the changed module impact.
- [x] Update the audit report with resolved, deferred, and remaining findings.
