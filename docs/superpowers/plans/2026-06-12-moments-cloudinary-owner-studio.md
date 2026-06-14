# Moments + Cloudinary + Owner Studio Plan

> **Post-refactor replacement:** The original pre-refactor plan file was not present in the current worktree or git history during the 2026-06-14 review. This file recreates the plan against the current `main` architecture after the Interview/auth refactor.
>
> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` or `superpowers:executing-plans` if implementing this plan. Keep checkbox status current.

**Goal:** Add a public Moments surface and an owner-only Studio workflow for creating, editing, publishing, and attaching Cloudinary-hosted media without weakening the current owner-only auth model.

**Product clarification:** This is not a long-form blog replacement. A Moment is closer to a social-media photo set: one title, one slug, one cover, many photos, optional captions/location/date/tags, and only a short optional note. Keep the existing `/blog` MDX workflow for essays and technical writing. Build Moments as a separate photo-first surface.

**Current verdict:** The old pre-refactor plan was stale. This post-refactor plan has now been partially executed in source: `/moments`, `/studio/moments`, the Cloudinary signature route, Supabase migration/types, repositories/actions, and public/owner UI are implemented. Supabase migration deployment and Cloudinary secret rotation remain external operational steps.

## 2026-06-14 Decision Record

This update answers the product questions raised after the codebase refactor:

| Question | Decision |
| --- | --- |
| Is this a blog feature? | No. Treat it as a separate `Moments` photo-set feature. |
| Should data live in SQL or NoSQL? | Use Supabase/Postgres for metadata and RLS. NoSQL is unnecessary for this single-owner structured workflow. |
| Where should images live? | Store image files in Cloudinary. Store only metadata and Cloudinary identifiers in Postgres. |
| Should Moments be stored as MDX? | No. Keep MDX for long-form `/blog`; use database rows for photo sets. |
| Should publishing happen through source code? | No for Moments. Build an owner-only UI because upload, reorder, cover selection, and captions are image-management tasks. |
| Can the existing GitHub auth be reused? | Yes, but generalize the current Interview-owner naming into site-owner auth before adding Studio. |
| Who is allowed to manage Moments? | Only the GitHub login `quan-vo-dinh`. Treat this as a username/login, not GitHub's numeric user id. |
| Should Aceternity draggable cards handle real image ordering? | No. Use them only as decorative public UI; use accessible Studio controls for actual ordering. |

### Content Boundary

Keep these product surfaces distinct:

```txt
/blog      -> source-controlled MDX essays and technical writing
/moments   -> public photo sets backed by Postgres + Cloudinary
/studio    -> owner-only authoring and media management UI
```

Do not retrofit `/blog` into a full CMS in this phase. The friction of source-controlled MDX is useful for essays, but it is the wrong authoring model for frequent photo uploads.

### First Implementation Slice

The first production slice should be small and verifiable:

1. Generalize owner auth from Interview-only naming to site-owner naming.
2. Configure `SITE_OWNER_GITHUB_USERNAME="quan-vo-dinh"` and update the Supabase owner seed/check.
3. Add Cloudinary env validation and a signed upload route guarded by `getOwnerAuthUser()`.
4. Add Moments tables/RLS and typed repositories.
5. Ship public `/moments` read-only gallery from seeded/manual DB rows.
6. Add owner Studio create/edit/upload/publish after the public read path is stable.

This keeps auth, storage, and rendering testable before the heavier Studio editing workflow is introduced.

### Implementation Status

Completed in source on `2026-06-14`:

- Added site-owner env/auth wiring for GitHub login `quan-vo-dinh`.
- Added `cloudinary` dependency and a guarded `/api/studio/cloudinary/sign` route.
- Added Supabase migration `202606140002_moments_owner_studio.sql`.
- Added Moments schema, slug, mapper, repository, and server actions.
- Added public `/moments` and `/moments/[slug]` routes.
- Added owner `/studio/moments`, `/studio/moments/new`, and `/studio/moments/[id]/edit` routes.
- Added shadcn/Aceternity UI source components for `focus-cards`, `direction-aware-hover`, `draggable-card`, and shadcn `textarea`.
- Added navbar item for Moments.

Operational steps still required outside this source change:

- Apply Supabase migrations to the target project.
- Configure production env vars for Supabase and Cloudinary.
- Rotate the Cloudinary API secret that was pasted into chat, then store only the rotated secret in env.
- Run browser smoke tests against a database where the new migration has been applied.

**Architecture principle:** Reuse the new post-refactor seams:

- `src/lib/env.ts` for validated server environment.
- `src/features/auth/lib/get-owner-auth-user.ts` for owner-only authorization.
- `proxy.ts` for Supabase session refresh on authenticated route families.
- `src/lib/supabase/types.ts` for typed table/RPC contracts.
- Vitest + CI `quality` gate for regression coverage.

---

## Product And Storage Decision

### Recommended Shape

Use **Supabase/Postgres for metadata** and **Cloudinary for media files**.

Do not store image files in:

- the git repository;
- `public/`;
- MDX files;
- Postgres byte columns;
- base64 strings.

Postgres should store:

- moment title/slug/status/visibility/date/location/tags;
- ordered photo asset rows;
- Cloudinary `public_id`, `asset_id`, dimensions, format, bytes, secure URL;
- captions and alt text;
- publish/draft metadata.

Cloudinary should store:

- original uploaded images;
- generated responsive transformations;
- delivery URLs;
- image optimization/cropping variants.

### SQL vs NoSQL

Choose **SQL/Postgres** for this project.

Reasons:

- the app already uses Supabase/Postgres and owner-only RLS;
- Moments have relational structure: one Moment has many ordered assets;
- drafts/publishing/status/visibility are easy to query;
- public reads and owner writes can be protected through RLS;
- it is easier to test and type through `src/lib/supabase/types.ts`.

NoSQL is unnecessary unless the product becomes an unstructured social platform with large custom per-post schemas. That is not the current goal.

### MDX vs Database

Use **database records**, not MDX files, for Moments.

Keep MDX for:

- long-form `/blog` posts;
- technical essays;
- content edited through code review/git history.

Use database + Owner Studio for:

- uploading photos;
- selecting/reordering photos;
- changing cover image;
- editing title/captions/location/date;
- draft/publish/archive from UI.

Optional prose can be a simple `note_markdown` or `description` field, but it should not be the primary content model.

### Authoring Workflow Decision

For a developer portfolio, both workflows are valid, but they serve different content:

| Content type | Recommended authoring | Why |
| --- | --- | --- |
| Technical blog essay | MDX in source | Versioned, reviewable, good for code snippets and long prose |
| Photo set / trip or street photography moment | Owner Studio UI | Upload/reorder/editing photos through code is unnecessary friction |
| Portfolio project data | Source-controlled data file | Changes are infrequent and structured |

Decision: **implement Owner Studio UI for Moments**. Do not force photo publishing through source commits.

### Owner Identity Decision

The existing GitHub/Supabase auth can be reused, but it should be generalized from Interview-only naming.

Required owner identity:

```txt
SITE_OWNER_GITHUB_USERNAME="quan-vo-dinh"
```

Notes:

- Treat `"quan-vo-dinh"` as the GitHub login/username, not GitHub's numeric internal ID.
- Current source still defaults `INTERVIEW_OWNER_GITHUB_USERNAME` to `vodinhquan`; that must be updated before implementing Studio.
- `src/data/resume.tsx` already links GitHub to `https://github.com/quan-vo-dinh`, matching the requested owner username.
- The existing `getOwnerAuthUser()` seam is correct, but the naming should become site-wide owner auth.
- The SQL migration currently hardcodes `vodinhquan`; a follow-up migration should either seed `quan-vo-dinh` or introduce a generic `site_owner_accounts` model.

Recommended migration path:

1. Add compatibility support for `SITE_OWNER_GITHUB_USERNAME` while still reading `INTERVIEW_OWNER_GITHUB_USERNAME` for one deployment.
2. Rename TypeScript helpers from `isInterviewOwner` toward `isSiteOwner` or wrap them behind site-owner names.
3. Add a Supabase migration that creates or reuses a generic owner predicate, then updates the seed/check to `quan-vo-dinh`.
4. Update tests to prove `quan-vo-dinh` is accepted and any other GitHub username is rejected.
5. Only then expose `/studio` routes and Cloudinary signing.

---

## Evidence From Current Codebase

CodeGraph after the refactor:

- 158 indexed files.
- 1,236 nodes.
- 2,129 edges.
- Index up to date.

Pre-implementation source state:

- No tracked `src/app/moments/**`.
- No tracked `src/app/studio/**`.
- No tracked `src/app/api/studio/cloudinary/**`.
- No tracked Cloudinary domain modules.
- `package.json` had no `cloudinary` or `next-cloudinary` dependency.
- `next.config.mjs` had security headers but no Cloudinary image remote pattern.
- Auth is now owner-only through `getOwnerAuthUser()` plus Supabase RPC `is_interview_owner`.
- `proxy.ts` currently matches only `/auth/:path*` and `/interview/:path*`.
- The 2026-06-14 Supabase migration must be applied before owner-only database reads/writes are production-ready.

Context7 documentation check:

- Cloudinary signed uploads should use a server signature endpoint for Upload Widget flows.
- `next-cloudinary` supports `signatureEndpoint` for signed widget uploads.
- Cloudinary Node SDK signs upload parameters with `cloudinary.utils.api_sign_request(params, apiSecret, "sha256")`.

UI registry check:

- Project registries include `@shadcn`, `@magicui`, and `@aceternity`.
- shadcn has the needed Studio primitives: `dialog`, `alert-dialog`, `sheet`, `form`, `card`, `hover-card`.
- Magic UI has useful public polish components such as `blur-fade`, `magic-card`, `glare-hover`, `bento-grid`, `marquee`, `animated-grid-pattern`.
- Aceternity has the requested `focus-cards`, `draggable-card`, and `direction-aware-hover` registry items.

---

## Target Surface

Public routes:

```txt
/moments
/moments/[slug]
```

Owner-only routes:

```txt
/studio
/studio/moments
/studio/moments/new
/studio/moments/[id]/edit
```

Owner-only route handlers:

```txt
/api/studio/cloudinary/sign
/api/studio/cloudinary/webhook   # optional, only if Cloudinary webhook reconciliation is needed
```

---

## Implementation Plan

### 1. Auth And Route Protection

Old assumptions to remove:

- Do not introduce a new owner auth stack.
- Do not use generic multi-user ownership rules.
- Do not reference `middleware.ts`; the project now uses `proxy.ts`.
- Do not keep Interview-specific owner naming when adding a second owner-only product area.

Updated direction:

- Reuse `getOwnerAuthUser()` in every Studio page loader, server action, and route handler.
- Generalize env naming to `SITE_OWNER_GITHUB_USERNAME="quan-vo-dinh"` while keeping a compatibility alias only if needed during migration.
- Add `/studio/:path*` and `/api/studio/:path*` to `proxy.ts` only when routes are implemented.
- Keep `/moments` public and avoid proxy/auth work there.
- Sign-in should reuse `/auth/sign-in/github?next=/studio/moments`.
- Non-owner sessions must remain rejected by the existing owner-only callback/RPC model.

Checklist:

- [x] Add `requireOwner()` helper if repeated owner guards appear in 3+ modules.
- [x] Rename or wrap Interview-specific owner env/function names behind site-owner names.
- [x] Configure the allowed GitHub owner username as `quan-vo-dinh`.
- [x] Extend `proxy.ts` matcher to include Studio routes after creating them.
- [x] Add tests for Studio redirect/authorization helpers.

### 2. Environment Configuration

Old assumptions to remove:

- Do not read `process.env.CLOUDINARY_*` directly in route handlers or components.
- Do not put secrets in client env variables.

Updated direction:

- Extend `src/lib/env.ts` with validated Cloudinary server config.
- Keep only non-secret values public if strictly required.
- Prefer `CLOUDINARY_URL` or explicit server-only values:

```txt
SITE_OWNER_GITHUB_USERNAME
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_MOMENTS_FOLDER
```

Checklist:

- [x] Update `src/lib/env.ts`.
- [x] Update `.env.example` with placeholders.
- [x] Replace the old Interview-owner default with the site owner username `quan-vo-dinh`.
- [x] Ensure API secret is never exposed to client components.

### 3. Dependencies

Current dependency state:

- No Cloudinary package is installed.

Recommended direction:

- Add `cloudinary` for server-side signature generation and Admin API usage.
- Add `next-cloudinary` only if the Upload Widget is preferred over a custom direct upload UI.
- If using raw Cloudinary URLs with `next/image`, add `res.cloudinary.com` to `next.config.mjs` `images.remotePatterns`.
- If using `CldImage`, keep usage scoped to the Moments feature and still verify bundle impact.

Checklist:

- [x] Add selected dependency or dependencies with pnpm.
- [x] Run `pnpm audit --prod` after install.
- [x] Keep Cloudinary client code out of public routes unless needed for rendering.

### 4. Data Model

Add a new migration after the current owner-only Interview migrations.

Suggested tables:

```txt
moments
moment_media_assets
```

`moments`:

- `id uuid primary key`
- `slug text unique not null`
- `title text not null`
- `description text`
- `note_markdown text`
- `occurred_at date`
- `location text`
- `status text check in ('draft', 'published', 'archived')`
- `visibility text check in ('public', 'private')`
- `cover_asset_id uuid null`
- `tags text[] not null default '{}'`
- `created_by uuid references auth.users(id)`
- `created_at timestamptz`
- `updated_at timestamptz`
- `published_at timestamptz null`
- `sort_key timestamptz`

`moment_media_assets`:

- `id uuid primary key`
- `moment_id uuid null references moments(id) on delete set null`
- `cloudinary_public_id text not null unique`
- `cloudinary_asset_id text`
- `resource_type text`
- `secure_url text not null`
- `width integer`
- `height integer`
- `format text`
- `bytes integer`
- `alt text`
- `caption text`
- `sort_order integer not null default 0`
- `created_by uuid references auth.users(id)`
- `created_at timestamptz`
- `updated_at timestamptz`

Recommended display DTO:

```ts
type MomentAssetView = {
  id: string;
  publicId: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
};

type MomentSummaryView = {
  slug: string;
  title: string;
  description: string | null;
  occurredAt: string | null;
  location: string | null;
  cover: MomentAssetView | null;
  photoCount: number;
};

type MomentDetailView = MomentSummaryView & {
  noteMarkdown: string | null;
  assets: MomentAssetView[];
};
```

RLS:

- Public can read only `published` + `public` moments and their attached assets.
- Owner can select/insert/update/delete all moment rows.
- Owner predicate should reuse the existing `public.is_interview_owner()` function or be renamed/generalized later to `public.is_site_owner()`.

Important naming note:

- `is_interview_owner()` now protects the owner account globally. For this feature, either reuse it as-is to avoid migration churn, or introduce `is_site_owner()` and update Interview policies in a separate deliberate migration. Do not silently fork owner logic.
- If reusing the current owner table temporarily, update the owner seed/check from `vodinhquan` to `quan-vo-dinh` before production use.

Checklist:

- [x] Create a new migration for Moments tables/RLS.
- [x] Update `src/lib/supabase/types.ts`.
- [x] Add migration comments explaining owner function reuse or rename.

### 5. Cloudinary Upload Signature Endpoint

Route:

```txt
src/app/api/studio/cloudinary/sign/route.ts
```

Rules:

- Must call `getOwnerAuthUser()` before signing anything.
- Must validate allowed params with Zod.
- Must sign only whitelisted parameters.
- Must force folder/tags server-side.
- Must never accept arbitrary folder from the client.
- Must return only `signature`, `timestamp`, `apiKey`, `cloudName`, and allowed upload params.

Allowed signing params:

```ts
type CloudinaryMomentUploadSignatureInput = {
  publicId?: string;
  context?: string;
};
```

Server-owned params:

```ts
{
  timestamp,
  folder: env.cloudinaryMomentsFolder,
  tags: "moments,owner-studio",
}
```

Context7-supported signing API:

```ts
cloudinary.utils.api_sign_request(paramsToSign, apiSecret, "sha256")
```

Checklist:

- [x] Add signature route.
- [x] Add unit tests for unauthorized, malformed input, and signed response shape.
- [x] Avoid secret-bearing logging; no non-secret upload diagnostics were needed in the first slice.

### 6. Server Repositories And Actions

Recommended feature boundary:

```txt
src/features/moments/
  actions/
    moment-actions.ts
  components/
    moment-card.tsx
    moment-form.tsx
    media-picker.tsx
    media-grid.tsx
  lib/
    moment-schema.ts
    moment-repository.ts
    moment-slug.ts
    cloudinary-signature.ts
  types.ts
```

Rules:

- Public `/moments` pages should use server-only repository reads.
- Studio mutations should validate input with Zod.
- Do not import raw Supabase client logic into client components.
- Do not pass Cloudinary secrets or full database rows to client components.
- Public DTOs should contain only display-ready fields.

Checklist:

- [x] Add public repository methods for published moments.
- [x] Add owner repository methods for drafts and all statuses.
- [x] Add server actions for create/update/publish/archive/delete.
- [x] Add slug uniqueness handling.

### 7. Public Moments UI

Target pattern:

- Match the compact public site identity already used by Home/Blog/Interview.
- Public list should feel editorial, not like a SaaS dashboard.
- Detail route should support image gallery, captions, optional prose, and metadata.
- Avoid making this look like a generic social feed. It should feel like a curated personal photo wall.

Mandatory UI planning artifact:

| UI Area | Purpose | Pattern | Library/Source | Component/Block/Asset |
| ------- | ------- | ------- | -------------- | --------------------- |
| Public list header | Introduce Moments as a visual diary | compact editorial heading + count | existing Blog/Interview + Magic UI | `BlurFade`, subtle grid/background only |
| Moment grid | Browse photo sets | image-first cards with focus/hover | Aceternity + project-owned adaptation | `@aceternity/focus-cards` |
| Moment card hover | Show title/location/date over image | directional overlay | Aceternity | `@aceternity/direction-aware-hover` |
| Moment detail gallery | View many photos | masonry/grid + lightbox later | shadcn + custom | `Card`, `ScrollArea`, `Dialog` when lightbox is added |
| Decorative photo pile | Add personality to hero/empty state | limited draggable visual | Aceternity | `@aceternity/draggable-card`, decorative only |
| Public motion | Reveal content tastefully | subtle entrance | Magic UI/current project | `BlurFade`, maybe `magic-card`/`glare-hover` sparingly |

Candidate UI:

| Option | Source | Composition | Pros | Cons | Decision |
| --- | --- | --- | --- | --- | --- |
| Conservative | Existing Blog + Cards | list/detail with subtle BlurFade | Fits site, low dependency | Less visual polish | Acceptable fallback |
| Polished | shadcn + Magic UI + Aceternity | Focus Cards list, Direction Aware Hover cards, subtle BlurFade | Best fit for photo sets while preserving the site style | More client code and motion to govern | Recommended |
| Experimental | Aceternity Draggable Card + bento/masonry | photo pile hero + interactive gallery | Memorable and tactile | Can hurt mobile/a11y if overused | Use only as decorative hero/empty state |

Component discovery:

- `@aceternity/focus-cards`: good for the public Moments index where hovering one photo set dims the rest.
- `@aceternity/direction-aware-hover`: good for individual image cards with title/date/location overlays.
- `@aceternity/draggable-card`: use only for a small decorative photo pile or empty state; do not use it for real asset ordering.
- shadcn primitives should still own accessibility-heavy interactions such as Dialog/Sheet/AlertDialog/Form.

Install command if these are selected:

```bash
pnpm dlx shadcn@latest add @aceternity/focus-cards @aceternity/draggable-card @aceternity/direction-aware-hover
```

Checklist:

- [x] Add `/moments` public list.
- [x] Add `/moments/[slug]` detail.
- [x] Add navbar item only after routes render.
- [x] Add empty state.
- [x] Add Open Graph metadata per detail page when practical.

### 8. Owner Studio UI

Target pattern:

- Owner utility, not multi-user admin SaaS.
- Use shadcn primitives for forms, dialogs/sheets, select/tabs, tooltip, and accessible controls.
- Reuse existing auth button patterns.
- Keep Studio calmer than the public gallery. Aceternity/Magic effects are for public visual surfaces, not for core form workflows.

Studio component mapping:

| UI Area | Purpose | Pattern | Library/Source | Component/Block/Asset |
| ------- | ------- | ------- | -------------- | --------------------- |
| Moment list | Manage drafts/published/archive | table/list cards + filters | shadcn | `Card`, `Tabs`, `Badge`, `Button`, `Select` |
| Moment editor | Edit title/date/location/tags/note | accessible form | shadcn | `form`, `Input`, `Select`, `Textarea` when added |
| Media upload | Upload images to Cloudinary | signed widget/custom upload | Cloudinary + shadcn | `Button`, progress/alert states |
| Media library | Pick/reuse uploaded assets | grid + detail sheet | shadcn | `Sheet`, `Dialog`, `ScrollArea`, `Card` |
| Delete/archive | Confirm destructive action | confirmation dialog | shadcn | `AlertDialog` |
| Reorder photos | Reorder gallery assets | keyboard-accessible ordered list | custom/dnd-kit later | Do not use Aceternity draggable card for production ordering |

Minimum Studio features:

- Moment list by status.
- Create/edit form.
- Upload/select Cloudinary media.
- Set cover image.
- Reorder gallery items.
- Draft/publish/archive.
- Delete only with confirmation.

Checklist:

- [x] Add `/studio/moments`.
- [x] Add `/studio/moments/new`.
- [x] Add `/studio/moments/[id]/edit`.
- [x] Add owner-only empty/error states.
- [x] Add keyboard accessible media picker.
- [x] Add clear save/publish/archive success and error states.

### 9. Testing And Quality Gates

Required commands:

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm audit --prod
```

Required tests:

- signature route rejects anonymous users;
- signature route rejects non-owner sessions;
- signature route does not sign arbitrary folders;
- moment schema rejects invalid status/visibility;
- slug generation is deterministic;
- public repository returns only published public moments;
- owner repository can read drafts;
- public route does not require auth;
- Studio route redirects or errors for non-owner;
- GitHub owner check accepts `quan-vo-dinh` and rejects other usernames;
- Moment create/update accepts title + ordered images without requiring MDX/prose.

Checklist:

- [x] Add unit tests before implementation where logic is pure.
- [x] Add route/action tests around auth boundaries where feasible.
- [x] Run full `pnpm quality` before completion.

### 10. Deployment Order

Do this in order:

1. Apply and verify `202606140001_secure_learning_progress.sql` if not already deployed.
2. Generalize owner env/auth naming and configure `SITE_OWNER_GITHUB_USERNAME="quan-vo-dinh"`.
3. Add Cloudinary env values locally and in hosting provider.
4. Add Cloudinary dependency/dependencies.
5. Add Moments migration and update Supabase types.
6. Implement signed upload endpoint.
7. Implement repositories/actions.
8. Implement public Moments pages.
9. Implement Owner Studio pages.
10. Extend `proxy.ts` for Studio routes.
11. Run quality gate and browser smoke tests.

Do not deploy Studio routes before the owner-only Supabase migration and Cloudinary secrets are configured.

---

## Explicitly Deferred

- Multi-user author roles.
- Public uploads.
- Comments/reactions/social features.
- Analytics dashboard.
- Cloudinary webhook reconciliation unless direct upload result persistence proves insufficient.
- Full DAM replacement; this is a small owner media library for Moments.
- Moving existing Interview owner RPC names to generic site-owner names in the same change.
- Rich MDX blog editor. Keep `/blog` source-controlled MDX for now.
- Multi-caption social feed behavior, likes, shares, comments, or followers.

---

## Tooling Notes

CodeGraph:

```bash
codegraph sync .
codegraph status .
```

Context7:

```bash
npx ctx7@latest library Cloudinary "Update a Next.js 16 owner-only media/moments plan after refactor..."
npx ctx7@latest docs /websites/cloudinary "Next.js owner-only media studio: signed upload endpoint..."
npx ctx7@latest docs /cloudinary/cloudinary_npm "Node SDK api_sign_request signed upload parameters..."
```

shadcn/Magic/Aceternity:

```bash
pnpm dlx shadcn@latest add @aceternity/focus-cards @aceternity/draggable-card @aceternity/direction-aware-hover
```

Checked registry candidates:

- shadcn `dialog`, `alert-dialog`, `sheet`, `form`, `card`, `hover-card`.
- Magic UI `blur-fade`, `magic-card`, `glare-hover`, `bento-grid`, `marquee`, `animated-grid-pattern`.
- Aceternity `focus-cards`, `draggable-card`, `direction-aware-hover`.

---

## Code Quality Notes

### Solid

- The refactor introduced a real owner-auth seam that Studio can reuse.
- Environment validation now has a single server entry point.
- CI/test/audit gates exist and should cover this feature from day one.

### Debt Flags

- `FLAG001 [MISSING_SOURCE]` The original Moments/Cloudinary plan and source routes are absent from tracked source; this replacement plan should be treated as the current baseline.
- `FLAG002 [OWNER_NAMING]` `is_interview_owner()` is now effectively a site-owner predicate. Reuse deliberately or rename in a separate migration.
- `FLAG003 [STALE_ARTIFACTS]` `.next/dev` contains old generated Moments/Studio artifacts. Do not use generated artifacts as implementation evidence.
- `FLAG004 [CONTENT_MODEL]` Treating Moments as MDX blog posts would make image upload/reorder/publish unnecessarily painful.

### Blockers Before Implementation

- `BLOCK001 [DEPLOYMENT_ORDER]` Apply the owner-only Supabase migration before deploying Studio writes.
- `BLOCK002 [SECRET_BOUNDARY]` Cloudinary API secret must stay server-only and be accessed only through validated env helpers.
- `BLOCK003 [AUTH_BOUNDARY]` Studio routes and signature endpoints must require `getOwnerAuthUser()`.
- `BLOCK004 [OWNER_IDENTITY]` Configure and test `quan-vo-dinh` as the only allowed GitHub owner before exposing Studio.
