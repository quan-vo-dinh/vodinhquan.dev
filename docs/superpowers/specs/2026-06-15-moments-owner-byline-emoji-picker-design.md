# Moments Owner Byline And Emoji Picker Design

**Date:** 2026-06-15

## Goal

Improve the Moments experience in two focused ways:

1. Replace the small curated emoji list in the owner form with a broad,
   searchable, categorized emoji catalog.
2. Add a compact owner identity block to the top-right of the public
   `/moments` header.

The changes must preserve the website's narrow `max-w-2xl` layout, neutral
visual language, low-motion behavior, and existing server/client boundaries.

## Current State

- `MomentEmojiField` is a controlled client component that correctly inserts an
  emoji at the saved cursor position, but exposes only 32 hard-coded emojis.
- `/moments` uses a centered header and the existing `BlurFade` motion pattern.
- The authoritative owner identity already lives in `DATA`:
  `Vo Dinh Quan`, initials `VDQ`, and avatar `/me.jpg`.
- The project already has shadcn-compatible `Popover`, `Avatar`, `Button`, and
  form controls.

## UI Decision

| Option | Composition | Pros | Cons | Decision |
| --- | --- | --- | --- | --- |
| Conservative | Existing Popover + a larger local emoji array | No dependency and complete visual control | Static data becomes large, incomplete, and expensive to maintain | Reject |
| Polished | Existing shadcn Popover + Frimousse primitives | Search, categories, virtualization, current emoji data, accessible keyboard behavior, fully themeable | Adds one focused client dependency | Choose |
| Experimental | Full-screen command/dialog emoji browser | More room for recents, skin tones, and advanced navigation | Too heavy for a small form helper and inconsistent with Owner Studio restraint | Reject |

Frimousse is the selected option because it is unstyled and composable. It can
adopt the project's semantic Tailwind tokens instead of introducing another
visual system.

## Component Composition

| UI Area | Purpose | Pattern | Source | Component |
| --- | --- | --- | --- | --- |
| Emoji trigger | Open picker without losing the field cursor | Icon button | Existing shadcn | `Button` + `SmilePlus` |
| Emoji overlay | Keep the picker compact and anchored to the field | Popover | Existing shadcn | `Popover` |
| Emoji catalog | Search and browse the full catalog | Virtualized searchable list | Frimousse | `EmojiPicker` primitives |
| Owner identity | Attribute the public photo diary | Compact byline | Existing project + shadcn | `Avatar`, `AvatarImage`, `AvatarFallback` |
| Public reveal | Match the current Moments header motion | Subtle entrance | Existing Magic UI | Existing `BlurFade` wrapper |

## Layout

### Emoji Picker

- Keep the existing icon trigger beside the field label.
- Use a popover constrained to the viewport and approximately 20rem wide.
- Put a visible search input at the top.
- Render categorized emoji rows in a fixed-height virtualized viewport.
- Show concise loading and no-result states.
- Selecting an emoji inserts its `emoji` character at the remembered cursor,
  closes the popover, restores focus, and places the caret after the inserted
  character.

### Moments Owner Byline

- Replace the centered-only header composition with a responsive header row.
- The title, count badge, and description remain on the left.
- The byline sits at the top-right on desktop and flows below the description
  on narrow screens.
- The byline contains a `size-8` avatar, `Curated by`, and `Vo Dinh Quan`.
- The avatar uses `/me.jpg`, `VDQ` as its required fallback, and the owner's
  name as its alt text.
- The byline is informational rather than a new navigation action.

## Boundaries

- `/moments` remains a Server Component and reads owner identity directly from
  `DATA`; no profile API or duplicated owner constants are introduced.
- `MomentEmojiField` remains the client boundary because it owns input state,
  cursor restoration, popover state, and emoji selection.
- Frimousse is imported only by the owner form picker and does not affect public
  Moments data fetching.
- Existing Moment persistence and server actions are unchanged.

## States And Accessibility

- The search input has an accessible label and useful placeholder.
- Emoji buttons retain Frimousse keyboard navigation and active-item semantics.
- Loading and empty search results are announced as visible text.
- The trigger keeps its field-specific `aria-label`.
- The owner avatar always has an image alt and text fallback.
- The byline wraps safely on small screens without absolute positioning.
- Existing reduced-motion behavior remains unchanged.

## Verification

1. Add focused tests that verify the owner byline renders authoritative owner
   data and that the picker delegates the selected emoji character to the
   existing insertion behavior.
2. Run the focused tests once before implementation and confirm they fail for
   the missing features.
3. Implement the minimal UI and dependency changes.
4. Run `pnpm lint`, `pnpm test`, `pnpm exec tsc --noEmit`, and `pnpm build`.
5. Verify `/moments` and the Studio Moment form in the in-app browser at desktop
   and narrow viewport widths.
6. Confirm search, keyboard selection, cursor insertion, loading/empty states,
   avatar fallback, and responsive wrapping.

## Explicitly Deferred

- Recently used emojis and persistence.
- Custom emoji uploads.
- Skin-tone preference persistence.
- Making the owner byline clickable.
- A separate owner/profile data service.
