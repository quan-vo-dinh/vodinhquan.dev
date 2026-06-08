---
name: personal-website-ui-architect
description: Use when working on UI implementation, UI refactors, public site, Owner Studio, CMS, section registry, section editor, media library, publishing workflow, i18n UI, shadcn/ui, Magic UI, Alternative UI, Aceternity-style variants, BlockNote, icons, logos, or media in this personal website platform.
---

# Personal Website UI Architect

This skill governs UI work for the single-owner personal website platform. It keeps future agents from shipping generic CRUD UI, uncontrolled page-builder behavior, or shallow component usage.

## Required Reading

Before coding, read the relevant files from `docs/ui/`. For most UI work, start with:

- `docs/ui/00_UI_GOVERNANCE.md`
- `docs/ui/01_DESIGN_SYSTEM.md`
- `docs/ui/09_COMPONENT_DECISION_MATRIX.md`
- `docs/ui/11_UI_ACCEPTANCE_CHECKLIST.md`

Then read the surface-specific docs:

- Public Site: `02_PUBLIC_SITE_PATTERNS.md`, `04_SECTION_REGISTRY_CONTRACT.md`, `06_I18N_CONTENT_RULES.md`, `14_SECTION_VARIANT_LIBRARY.md`, `15_ICON_MEDIA_REGISTRY.md`
- Owner Studio: `03_OWNER_STUDIO_PATTERNS.md`, `05_EDITOR_AND_FORM_GUIDELINES.md`, `07_MEDIA_LIBRARY_PATTERN.md`, `08_PUBLISHING_WORKFLOW_UI.md`
- Testing/verification: `12_TESTING_UI_CONTRACT.md`
- Taste anchors and prohibitions: `13_VISUAL_REFERENCES.md`, `10_ANTI_PATTERNS.md`

Also inspect the current repository before planning:

- `src/app`
- `src/components`
- `src/components/ui`
- `src/components/magicui`
- `src/components/section`
- `src/data/resume.tsx`
- `components.json`
- `src/app/globals.css`
- `docs/superpowers/specs/2026-06-07-personal-website-platform-design.vi.md`

## Mandatory Workflow

Do not implement the first plausible UI. First produce:

1. Target surface.
2. Target pattern.
3. Affected routes.
4. Affected domain boundary.
5. Draft/published behavior.
6. i18n behavior.
7. Loading, empty, error, save, conflict, and success states.
8. Accessibility considerations.
9. Verification plan.

## Component Exploration

Check options in this order:

1. Existing project components and current public visual identity.
2. shadcn/ui components and blocks.
3. Magic UI components/effects when public-facing or visual-heavy.
4. Alternative UI components/blocks/effects when public-facing or visual-heavy.
5. Aceternity-style section variants when appropriate.
6. Icon/media registry.
7. Custom component only when the above options do not fit.

For every meaningful UI task, create this table:

| UI Area | Purpose | Pattern | Library/Source | Component/Block/Asset |
| ------- | ------- | ------- | -------------- | --------------------- |

For public-facing or visual-heavy UI, also compare:

| Option | Composition | Library/Source | Pros | Cons | Decision |
| ------ | ----------- | -------------- | ---- | ---- | -------- |
| Conservative | Existing project + shadcn/ui | project/shadcn |  |  |  |
| Polished | shadcn/ui + Magic UI / Alternative UI | shadcn/Magic/Alternative UI |  |  |  |
| Editorial/Experimental but safe | Alternative UI / Aceternity-style / project-owned variant | Alternative/Aceternity/project-owned |  |  |  |

If fewer than three options are viable, explain why.

## Library Policy

- shadcn/ui: Studio, forms, dialogs, sidebars, tables, tabs, dropdowns, command, feedback, accessible interactions.
- Magic UI: public-facing brand motion, tasteful visual enhancement, selected public section effects.
- Alternative UI: public-facing visual components, layout blocks, creative cards, bento sections, hero/project/skills/contact variants, empty states. Adapt to project visual identity, Tailwind tokens, accessibility, responsive behavior, and Section Registry.
- Aceternity-style variants: selected public editorial sections only, through registered variants or project-owned adaptation.
- BlockNote: controlled rich block content, JSON-compatible persistence, dynamic loading, no unsafe rendering.
- dnd-kit: controlled section reordering.
- Motion: controlled animation, mainly public site or light transitions.

Do not use Magic UI, Alternative UI, or Aceternity-style UI for core Studio forms, destructive actions, tables, publishing controls, media management primitives, auth-sensitive flows, revision history, or autosave conflicts.

## Implementation Gate

Only implement after the planning artifacts above exist. Keep public visual identity intact unless the user explicitly asks for a redesign. Keep Owner Studio low-motion, readable, practical, and shadcn-first.

## Final Review

Before reporting completion:

1. Review against `docs/ui/11_UI_ACCEPTANCE_CHECKLIST.md`.
2. Run available verification commands appropriate to the change.
3. List created/updated files.
4. Explain how the chosen UI composition follows the governance framework.
5. Report skipped verification honestly.
