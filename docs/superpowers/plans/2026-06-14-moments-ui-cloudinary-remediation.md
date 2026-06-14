# Moments UI And Cloudinary Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore reliable rendering across the site, fix signed Cloudinary uploads, and polish the public Moments gallery and owner Studio.

**Architecture:** Keep Moments data and authorization boundaries unchanged. Remove the optional Cloudinary upload preset from the signed request, replace the script-injecting theme provider with a small project-owned client provider, make reveal motion fail-open, and introduce route-specific wide shells for photo and Studio surfaces.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Motion, Cloudinary Node SDK, Vitest, Browser plugin.

---

## UI Decision Record

| UI Area | Purpose | Pattern | Library/Source | Component |
| --- | --- | --- | --- | --- |
| Public Moments index | Browse photo sets | editorial image cards | project + Aceternity adaptation | project-owned gallery card |
| Moment detail | Preserve photography composition | natural-ratio masonry | project + Next Image | responsive image figure |
| Studio shell | Give editing tools enough room | wide owner workspace | project + shadcn | route layout |
| Destructive actions | Prevent accidental deletion | confirmation dialog | shadcn | `AlertDialog` |
| Upload feedback | Show per-file progress and errors | accessible status panel | shadcn | `Progress`, status text |
| Public motion | Gentle reveal that cannot hide content | CSS progressive enhancement | project + Magic UI reference | `BlurFade` |

Chosen composition: use the polished option for public Moments and a conservative shadcn-first option for Studio. Avoid hover-only information, decorative Studio motion, and production ordering based on draggable visual cards.

## Task 1: Lock Regressions With Tests

**Files:**
- Modify: `src/features/moments/lib/cloudinary-signature.test.ts`
- Modify: `src/app/api/studio/cloudinary/sign/route.test.ts`
- Modify: `src/lib/env.test.ts`
- Create: `src/components/theme-provider.test.ts`
- Create: `src/components/magicui/blur-fade.test.ts`

- [x] Assert signed uploads omit `upload_preset`.
- [x] Assert Cloudinary env parsing does not require a preset.
- [x] Assert the theme provider does not emit a React-rendered script tag.
- [x] Assert BlurFade server markup is visible by default.
- [x] Run focused tests and confirm each fails for the current implementation.

## Task 2: Fix Signed Cloudinary Uploads

**Files:**
- Modify: `src/features/moments/lib/cloudinary-signature.ts`
- Modify: `src/lib/env.ts`
- Modify: `.env.example`
- Modify: `src/features/moments/components/moment-upload-panel.tsx`
- Modify: `docs/superpowers/plans/2026-06-12-moments-cloudinary-owner-studio.md`

- [x] Remove `upload_preset` from server-owned signed parameters.
- [x] Keep `folder`, `tags`, `timestamp`, optional context, and optional public ID in the signature.
- [x] Parse Cloudinary JSON error messages and show the provider message in Studio.
- [x] Keep credentials server-only.
- [x] Run focused signature, route, and env tests until green.

## Task 3: Restore Reliable Rendering

**Files:**
- Modify: `src/components/theme-provider.tsx`
- Modify: `src/components/mode-toggle.tsx`
- Modify: `src/components/magicui/blur-fade.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [x] Replace `next-themes` with a project-owned light/dark context using local storage after mount.
- [x] Ensure server markup contains no injected script.
- [x] Convert BlurFade to visible-first CSS progressive enhancement with reduced-motion support.
- [x] Remove the unused `next-themes` dependency.
- [x] Run focused rendering tests until green.

## Task 4: Polish Public Moments

**Files:**
- Modify: `src/features/moments/components/moments-index-page.tsx`
- Modify: `src/features/moments/components/moment-detail-page.tsx`
- Modify: `src/components/ui/focus-cards.tsx`
- Create: `src/app/moments/layout.tsx`

- [x] Give Moments a route-owned wide content shell.
- [x] Remove the duplicate list beneath the cover gallery.
- [x] Keep title and metadata visible without hover.
- [x] Render detail photos using stored dimensions and natural aspect ratios.
- [x] Keep captions visible or discoverable on touch and keyboard.
- [x] Verify empty and unavailable states.

## Task 5: Polish Owner Studio

**Files:**
- Create: `src/app/studio/layout.tsx`
- Modify: `src/features/moments/components/studio-moment-list.tsx`
- Modify: `src/features/moments/components/moment-form.tsx`
- Modify: `src/features/moments/components/moment-upload-panel.tsx`
- Modify: `src/features/moments/components/moment-assets-editor.tsx`
- Modify: `src/app/studio/moments/[id]/edit/page.tsx`
- Add: shadcn `alert-dialog`

- [x] Use a wide low-motion Studio workspace.
- [x] Improve list cards and empty-state call to action.
- [x] Use two-column desktop composition for metadata and media.
- [x] Add confirmation dialogs for deleting moments and assets.
- [x] Improve upload progress, disabled states, and screen-reader announcements.

## Task 6: Verify

- [x] Run focused tests.
- [x] Run `pnpm lint`.
- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Run Browser QA on `/moments`, `/moments/[slug]`, and available Studio routes.
- [x] Check desktop and 390px mobile viewports.
- [x] Confirm no relevant console errors, blank content, overflow, hover-only labels, or dock overlap.
