# Interview Practice Public Page — Design Spec

> Ngày tạo: 2026-06-08  
> Trạng thái: Draft để review trước khi lập implementation plan  
> Scope: Public MVP cho personal website hiện tại, có đường nâng cấp sang owner-only/private sau này

## 1. Evidence Snapshot

### 1.1 CodeGraph first

CodeGraph đã được dùng trước khi viết spec, đúng theo yêu cầu.

```bash
codegraph status .
codegraph query "interview blog navbar app route data resume accordion markdown flashcard question" --limit 80
codegraph context "Understand current personal website architecture before writing a design spec for a public Interview Practice page. Focus on Next.js App Router routes, navbar, blog route pattern, data/resume navigation, current UI components, Magic UI usage, shadcn components, content collections, data.json shape and future server-only/auth-protected path." --max-nodes 80 --max-code 18
codegraph files --max-depth 4
```

Kết quả chính:

- CodeGraph index up to date.
- Indexed scope: 65 files, 465 nodes, 748 edges.
- Public routes hiện tại: `/`, `/blog`, `/blog/[slug]`.
- `src/app/layout.tsx` bọc toàn site bằng `max-w-2xl`, `Navbar`, `ThemeProvider`, `TooltipProvider`, `FlickeringGrid`.
- `src/components/navbar.tsx` render dock nav từ `DATA.navbar`.
- `src/data/resume.tsx` đang có nav item `Home` và `Blog`.
- UI primitives sẵn có: accordion, avatar, badge, button, card, separator, tooltip.
- Magic UI sẵn có: `blur-fade`, `blur-fade-text`, `dock`, `flickering-grid`.
- Blog route dùng App Router server component, `searchParams`, pagination helper và metadata pattern.

### 1.2 User-provided feature analysis

Đã đọc lại toàn bộ attachment `pasted-text.txt` gồm 449 dòng. Bản phân tích đó mô tả một nền tảng luyện phỏng vấn IT hoàn chỉnh, có yếu tố paid platform/commercial product. Nó là reference để hiểu workflow học tập tốt, không phải yêu cầu sao chép toàn bộ sản phẩm.

Các module trong reference:

- Question bank theo technology/category.
- Topic/subcategory tabs với count.
- Difficulty filter.
- Scoped search trong category.
- Global search hoặc command palette `⌘K`.
- Accordion answer viewer, có inline code.
- Flashcards.
- Learning progress hoặc mark learned.
- Bookmark.
- Quick actions: copy, share/copy link, open detail/expand.
- Navigation: sidebar, breadcrumb, collapse sidebar.
- Metadata: count, badge độ khó, nhãn NEW.
- Theme, language switch, account avatar, settings, pricing.

Kết luận sản phẩm trong attachment: structured question bank + flashcards + progress tracking, giống giao thoa giữa LeetCode-style question list, Anki/Quizlet, technical knowledge base và personal learning tracker.

Product fit correction cho website này:

- Đây là personal/internal interview practice page dùng dữ liệu riêng của owner.
- Không xây paid learning platform, marketplace, subscription, premium tier hay multi-user SaaS.
- Các tính năng như pricing, paywall, account avatar cho nhiều user, settings nâng cao, monetization và premium content không thuộc roadmap mặc định.
- Chỉ giữ lại những tính năng phục vụ trực tiếp việc owner học/ôn phỏng vấn: question bank, taxonomy, filter/search, answer viewer, flashcards, local progress/bookmark, i18n nội dung.
- Future auth chỉ để khóa trang cho chính owner, không phải để mở user system công khai.

### 1.3 Current `data.json`

Đã kiểm tra trực tiếp `data.json`.

- Size: 4,745,926 bytes.
- Total questions: 2,389.
- Category count: 62.
- Required field check: 0 malformed records for `id`, `category`, `subcategory`, `level`, `q`, `a`, `q_en`, `a_en`.
- Levels:
  - `beginner`: 491
  - `intermediate`: 1,272
  - `advanced`: 626
- Top categories:
  - React: 144
  - JavaScript: 108
  - CSS: 89
  - AI Engineering: 82
  - React Native: 74
  - Node.js: 64
  - State Management: 63
  - Django: 62
  - Career & Non-Tech: 60
  - Angular: 60
  - TypeScript: 59
  - Golang: 58
  - Ruby: 58
  - Vue.js: 56
  - Python: 55

### 1.4 UI governance read

Đã đọc các docs liên quan:

- `docs/ui/00_UI_GOVERNANCE.md`
- `docs/ui/01_DESIGN_SYSTEM.md`
- `docs/ui/02_PUBLIC_SITE_PATTERNS.md`
- `docs/ui/06_I18N_CONTENT_RULES.md`
- `docs/ui/09_COMPONENT_DECISION_MATRIX.md`
- `docs/ui/11_UI_ACCEPTANCE_CHECKLIST.md`

Các ràng buộc áp dụng:

- Đây là Public Site, không phải generic SaaS dashboard.
- Giữ visual identity hiện tại: compact, developer-focused, neutral tokens, rounded cards, subtle border, light motion.
- Existing project components là nguồn ưu tiên trước khi tạo component mới.
- shadcn/ui dùng cho accordion, card, badge, button, tooltip, command/filter primitives.
- Magic UI chỉ dùng để giữ polish công khai, không làm UI rối hoặc che state.
- Vietnamese và English phải độc lập. English không fallback sang Vietnamese khi triển khai locale route về sau.

## 2. Product Decision

Build một public page mới `/interview` cho Interview Practice, nằm ngang hàng với `/blog` trong bottom dock navigation.

Product shape: personal learning tool embedded inside a personal website. It should feel like a focused owner utility that is temporarily public, not like a commercial interview-prep platform.

MVP hiện tại chấp nhận public data. Mục tiêu quan trọng hơn là tổ chức code theo server/data boundary đủ rõ để tương lai có thể:

- thêm GitHub login,
- bảo vệ route `/interview`,
- bảo vệ API/data access,
- chuyển progress/bookmark sang database,
- không phải viết lại UI từ đầu.

## 3. Non-Goals For MVP

Không làm trong MVP đầu tiên và cũng không xem là roadmap mặc định:

- Login/account/avatar thật.
- Pricing/paywall.
- Settings page đầy đủ.
- Subscription, premium tier, checkout hoặc monetization.
- Multi-user dashboard, team/admin, public user profile.
- Admin/studio CRUD để sửa câu hỏi.
- Database cho question bank.
- Database cho progress/bookmark.
- Full global command palette `⌘K`.
- Full detail route cho từng câu hỏi nếu list + copy link đã đủ dùng.
- AI translation hoặc auto content generation.
- Multi-user learning analytics.

Các tính năng trên chỉ được xem xét lại nếu owner đổi mục tiêu từ personal/internal tool sang product công khai. Với mục tiêu hiện tại, chúng là out of scope.

## 4. Target Surface And Boundaries

| Item | Decision |
| --- | --- |
| Target surface | Public Site, future private owner-only module |
| Target pattern | Personal structured learning tool: question bank + flashcard + local progress |
| Affected routes | Add `/interview`; future optional `/{locale}/interview`; future optional `/interview/[id]` |
| Affected domain boundary | New `interview-practice` feature boundary, separate from `resume`, `blog`, and public section components |
| Draft/published behavior | MVP reads static checked-in public question data; no draft model |
| i18n behavior | Use `vi` and `en` fields from data; default Vietnamese; English mode only renders `q_en/a_en` |
| Auth behavior | None in MVP; future protected route and server-only data access |

## 5. Recommended MVP Scope

### 5.1 Must ship

- Add `/interview` route.
- Add `Interview` nav item next to Blog.
- Read and validate `data.json`.
- Show polished page header with title, description, animated total question count, subtle public-site motion and technical atmosphere.
- Show grouped category navigation with technology logo/icon, group label, count, active highlight and `NEW` badge where configured.
- Show subcategory/topic filters with counts for selected category, using tabs/chips that remain usable on overflow.
- Show level filter: all, beginner, intermediate, advanced.
- Show scoped search for current result set with a real input component and search icon.
- Render question list as polished accordion cards with border, spacing, action icons, tooltips and readable metadata.
- Render answer content with markdown support, including inline code and simple code blocks.
- Show level badges.
- Show question index and id.
- Add flashcard mode for current filtered question set with designed card surface and icon controls.
- Add local learned/bookmark state with `localStorage` and visible state styling.
- Add copy question or copy share URL quick action with icons and accessible labels.
- Keep UI keyboard accessible and mobile usable.

### 5.2 Should ship if still small

- Empty states for no category/question/search result.
- URL search params for selected category, subcategory, level, query, and mode.
- Question counts updated by filter.
- Local progress summary for selected category.
- Category icon coverage for every known category in `data.json`, using stable fallback icon where a logo does not exist.
- A final UX fidelity pass against the reference learning workflow: active state, counts, badges, action tooltips, inline code, flashcard and mobile polish.

### 5.3 Defer

- Global `⌘K` search.
- Collapsible desktop sidebar.
- Dedicated question detail page.
- GitHub auth.
- Persistent server-side progress/bookmark.
- New badge management.
- Pricing/account/settings, unless the product direction changes away from personal/internal use.

## 6. Architecture

### 6.1 Feature folder

Use a feature boundary to avoid bloating `src/app/page.tsx` or `src/data/resume.tsx`.

```text
src/app/interview/page.tsx
src/features/interview-practice/
  components/
  data/
  lib/
  types.ts
```

Candidate files:

```text
src/features/interview-practice/data/questions.json
src/features/interview-practice/lib/question-schema.ts
src/features/interview-practice/lib/question-repository.ts
src/features/interview-practice/lib/question-filters.ts
src/features/interview-practice/lib/question-url-state.ts
src/features/interview-practice/components/interview-practice-page.tsx
src/features/interview-practice/components/category-nav.tsx
src/features/interview-practice/components/tech-icon.tsx
src/features/interview-practice/components/question-filters.tsx
src/features/interview-practice/components/question-list.tsx
src/features/interview-practice/components/question-card.tsx
src/features/interview-practice/components/flashcard-deck.tsx
src/features/interview-practice/components/local-learning-state.tsx
src/features/interview-practice/components/progress-summary.tsx
src/features/interview-practice/lib/category-meta.ts
```

`data.json` can be moved into the feature folder during implementation. If moving creates too much churn, the repository can initially read root `data.json`, but the spec target is feature-owned data.

### 6.2 Server/client split

Use server components for data loading and filtering where practical.

Server-side:

- parse/validate question data,
- compute categories and counts,
- compute filtered question set from `searchParams`,
- prepare only the DTO needed by the client.

Client-side:

- accordion interactions if needed,
- flashcard flip/next/previous,
- local learned/bookmark state,
- copy-to-clipboard actions.

The data access module should use `import "server-only"` so future private mode can enforce auth without changing component consumers.

### 6.3 Data types

Canonical raw question:

```ts
type InterviewQuestionRaw = {
  id: number;
  category: string;
  subcategory: string;
  level: "beginner" | "intermediate" | "advanced";
  q: string;
  a: string;
  q_en: string;
  a_en: string;
};
```

View DTO:

```ts
type InterviewQuestionView = {
  id: number;
  category: string;
  subcategory: string;
  level: "beginner" | "intermediate" | "advanced";
  question: string;
  answer: string;
};
```

Locale mapping:

- `vi`: `question = q`, `answer = a`
- `en`: `question = q_en`, `answer = a_en`

### 6.4 URL state

MVP should prefer URL state over hidden app state:

```text
/interview?category=Next.js&subcategory=Rendering&level=intermediate&q=cache&mode=list
/interview?category=React&mode=flashcards
```

Benefits:

- easy sharing,
- back/forward works,
- no extra state manager,
- future server-auth route remains simple.

### 6.5 Local learning state

For public MVP:

```text
interview-practice:v1:learned -> number[]
interview-practice:v1:bookmarks -> number[]
```

Use a small client hook around `localStorage`.

Rules:

- local state is enhancement only; page works without it.
- use question `id` as stable key.
- do not block server render on local storage.
- show client state after hydration.

Future private mode:

- replace local storage hook with a provider that reads/writes through authenticated route handlers.
- schema can become `user_question_state(user_id, question_id, learned_at, bookmarked_at, last_seen_at)`.

## 7. UI Design

### 7.1 Layout direction

The current root layout caps content at `max-w-2xl`. The interview page has denser navigation and lists, so the implementation should either:

- use a route-level wrapper that can visually extend wider inside the existing layout, or
- adjust root layout to support per-route width through a safe class strategy.

Recommended MVP: keep the root identity but allow `/interview` content to use a wider shell such as `max-w-5xl` inside the page. If the root wrapper blocks this visually, introduce a minimal layout affordance instead of rewriting global layout.

### 7.2 Page composition

Desktop:

- compact page header,
- left category nav with counts,
- main content with subtopic tabs/chips, filters/search, question list,
- optional sticky mini summary.

Mobile:

- category selector becomes horizontal scroll chips or select-like button,
- filters stack,
- question cards stay single column,
- flashcard controls stay bottom of card.

### 7.3 Component mapping

| UI Area | Purpose | Pattern | Library/Source | Component/Block/Asset |
| --- | --- | --- | --- | --- |
| Page header | Introduce page and count | Public tool header | Project + Magic UI | `BlurFade`, `NumberTicker`, `AnimatedGridPattern`, Tailwind tokens |
| Nav dock item | Route discovery | Dock navigation | Existing project | `DATA.navbar`, `DockIcon`, lucide icon |
| Category navigation | Browse technology areas | Grouped icon sidebar/chips | shadcn + SVGL + project registry | `ScrollArea`, `Badge`, `TechIcon`, `category-meta` |
| Technology logos | Fast visual recognition | Icon registry | `@svgl` + existing project icons + fallback | HTML/CSS/JS/TS/React/Next/Vue/Angular/Node/Nest/Python/FastAPI/Django/Go/Java/etc. |
| Subcategory filter | Topic map | Tabs/chips | shadcn + custom | `Tabs` or overflow chips |
| Difficulty filter | Narrow question set | Select/segmented buttons | shadcn | `Select`, `Button`, `Badge` |
| Search | Scoped search | Input control | shadcn | `Input`, lucide `Search` |
| Question list | Read and expand answers | Accordion card list | Existing shadcn + polish | `Accordion`, `Badge`, `Tooltip`, `Button`, `BorderBeam` sparingly |
| Answer rendering | Technical formatted prose | Markdown renderer | Existing deps | `react-markdown`, `remark-gfm` |
| Flashcards | Active recall | Designed card deck | shadcn + Magic UI polish | `Card`, `Button`, `Progress`, optional `BorderBeam` |
| Progress/bookmark | Local learning state | Toggle action | shadcn + lucide | `Button`, `Tooltip`, `Progress`, local hook |
| Empty states | No results | Designed compact card | shadcn + Magic UI | `Card`, muted text, optional subtle grid |

### 7.4 Registry discovery result

Discovery commands used before locking this spec:

- `mcp__shadcn.get_project_registries`: configured registries are `@shadcn` and `@svgl`.
- `mcp__shadcn.search_items_in_registries` for `tabs`, `input`, `scroll-area`, `select`, `progress`.
- `mcp__shadcn.search_items_in_registries` for SVGL logos: `html5`, `css`, `javascript`, `typescript`, `react`, `nextjs`, `vue`, `angular`, `nodejs`, `nestjs`, `python`, `fastapi`, `django`, `go`, `java`, `postgresql`, `mongodb`, `docker`, `redis`.
- `mcp__magicuidesign.searchRegistryItems` and `getRegistryItem` for `number-ticker`, `animated-grid-pattern`, `border-beam`, `bento-grid`.
- Web search checked broader shadcn/Alternative UI registry landscape; no Alternative UI registry is configured in this project. Use Alternative UI/Aceternity-style as inspiration only unless a compatible registry is intentionally added.

Selected additions for implementation:

- shadcn: `tabs`, `input`, `scroll-area`, `select`, `progress`.
- Magic UI: `number-ticker`, `animated-grid-pattern`, `border-beam`.
- SVGL: install core technology logos listed above.

`bento-grid` is not selected for MVP because this is an app-like learning surface, not a marketing feature grid.

### 7.5 Public UI option comparison

| Option | Composition | Library/Source | Pros | Cons | Decision |
| --- | --- | --- | --- | --- | --- |
| Conservative | Existing project + current shadcn primitives | project/shadcn | Fastest, preserves identity, lowest dependency risk | Too plain for requested polished learning workflow | Not enough |
| Polished | shadcn primitives + Magic UI reveal/number/grid/border polish + SVGL tech icons | shadcn/Magic UI/SVGL/project-owned | Best balance of polish, recognizability and maintainability | More registry components to install and QA | Recommended |
| Editorial/Experimental | Alternative UI/Aceternity-inspired dashboard-like layout | external inspiration/project-owned | Strong visual moment | Higher scope, may fight portfolio tone | Defer |

Selected composition: Polished, but restrained. Use existing visual identity and primitives; add only feature-owned components for the learning workflow.

## 8. Interaction Behavior

### 8.1 Category

- Default category should be a high-signal category. Use `Next.js` for MVP because the reference analysis centers on it and it matches the current website stack.
- If no category is provided in URL, redirect/normalize to a default category or render all categories overview.
- Recommended MVP: default to `Next.js`.

### 8.2 Filters

- Subcategory `all` includes every question in selected category.
- Level `all` includes every level.
- Search checks localized question and answer text for current locale.
- If search result is empty, show empty state with clear filter action.

### 8.3 Accordion

- MVP uses a single-open accordion for focus, matching the current work accordion pattern.
- Answer should render markdown safely. Raw HTML should not be enabled.

### 8.4 Flashcards

- Flashcard mode uses the current filtered question set.
- Front: question, category, subcategory, level.
- Back: answer.
- Controls: previous, next, flip, mark learned, bookmark.
- Empty filtered set shows a clear empty state.

### 8.5 Quick actions

- Copy question text.
- Copy URL with current filters and optional question id anchor.
- Toggle learned.
- Toggle bookmark.

Open/detail route is deferred for MVP.

## 9. i18n Plan

MVP route can be `/interview` with a local language toggle:

- Default language: Vietnamese.
- English mode reads `q_en/a_en`.
- Language choice can be URL param `lang=vi|en` or local state.
- Recommended MVP: URL param `lang=vi|en` for shareability.

Future locale routing:

- `/vi/interview` uses Vietnamese.
- `/en/interview` uses English.
- English must not fallback to Vietnamese.
- If an English field is missing in future data, hide that record or show owner-facing invalid data state only in private tools, not public fallback.

## 10. Future Auth And Privacy Path

MVP is public. The data being public is acceptable now.

Future private phase:

- Add GitHub OAuth with an allowlist for the owner's GitHub account only.
- Protect `/interview` in middleware or route-level auth checks.
- Protect any `/api/interview/*` route handlers.
- Keep `question-repository.ts` as `server-only`.
- Move local learned/bookmark state to authenticated persistent storage.
- Consider SQLite/Turso or Postgres only when persistent progress is needed.

This private phase is not a general user-account system. It is an owner-only gate for the same personal practice tool.

The important architecture choice now is to avoid coupling UI components directly to raw `data.json` imports. Components should consume typed DTOs so the data source can change later.

## 11. SEO And Public Exposure

Because the page is public in MVP:

- The rendered content can be crawled and copied.
- Avoid placing `data.json` in `public/`.
- Avoid shipping the full raw JSON into a Client Component bundle.
- The page can still render public questions server-side.

MVP SEO:

- Add page metadata for `/interview`.
- Do not generate individual SEO pages for every question yet.
- Do not add Schema.org for every question until the owner wants search engines to index question content aggressively.

## 12. Error, Loading, Empty, And State Handling

| State | Behavior |
| --- | --- |
| Loading | Server-rendered page normally avoids large loading state; client-only flashcard/progress can hydrate quietly |
| Empty data | Show owner-facing public-safe empty card: no questions available |
| Invalid data | Build/runtime validation should fail loudly in development; production can show stable error page if validation fails |
| Empty search/filter | Show compact empty state and clear filter action |
| Missing category param | Use default category or overview |
| localStorage unavailable | Hide learned/bookmark persistence but keep page usable |
| Copy fails | Show accessible fallback text or no-op with button state; no toast required in MVP unless Sonner is added |

## 13. Accessibility And Responsive Requirements

- All filters must be keyboard reachable.
- Accordion triggers must use semantic button behavior from Radix/shadcn.
- Flashcard flip must be a real button, not only card click.
- Bookmark/learned buttons need accessible labels.
- Color-coded level badges must include text labels.
- Touch targets should be at least comfortable mobile tap size.
- Search input must have a visible label or `aria-label`.
- Motion should be subtle and must not hide state changes.
- Long question/answer text must wrap without breaking layout.

## 14. Verification Plan

Implementation should verify:

```bash
pnpm lint
pnpm build
```

Manual/browser verification:

- `/interview` loads.
- Nav item appears next to Blog.
- Category filter changes question set.
- Subcategory counts match filtered category.
- Level filter works.
- Search works for Vietnamese and English.
- Accordion opens answers and renders inline code.
- Flashcard mode flips and navigates.
- Learned/bookmark state persists across reload.
- Mobile layout remains usable.
- No raw `data.json` is placed under `public/`.

Optional implementation checks:

- Inspect client bundle or source imports to confirm raw JSON is not imported by Client Components.
- Validate `data.json` with Zod before rendering.

## 15. Implementation Defaults

Use these defaults during implementation:

- Default category: `Next.js`, because the reference analysis centers on it and it matches the current website stack.
- Language state: `lang=vi|en`.
- Accordion mode: single-open.
- Detail route: defer.
- Category default can become configurable later, but it is not configurable in MVP.

## 16. Acceptance Criteria

The spec is ready for implementation planning when:

- MVP scope is accepted.
- Future auth path is accepted.
- Feature boundary is accepted.
- UI composition is accepted.
- Deferred items are accepted.

The implementation is complete when:

- `/interview` exists and is navigable from dock.
- It uses existing visual identity.
- It supports category, subcategory, level, search, accordion answer, flashcards, learned/bookmark local state and copy action.
- It does not import raw question JSON into Client Components.
- It passes lint and build.
