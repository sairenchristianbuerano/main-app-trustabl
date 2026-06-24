# CF Design System — Agent & Developer Guide

> **Two files. One prompt. That's it.**
> - `AGENT.md` — this file: implementation rules, phases, checklist, Figma guide
> - `cf-design-system.md` — visual identity + component code: jump to sections only, never read top to bottom

---

## Table of Contents

- [Single Prompt](#single-prompt)
- [Part 1 — Implementation Phases](#part-1--implementation-phases)
- [Part 2 — Rules](#part-2--rules)
- [Part 3 — Known Code Fixes](#part-3--known-code-fixes)
- [Part 4 — Per-File Checklist](#part-4--per-file-checklist)
- [Part 5 — UI Preview Page](#part-5--ui-preview-page)
- [Part 6 — Figma MCP Integration](#part-6--figma-mcp-integration)
- [Part 7 — How to Prompt](#part-7--how-to-prompt)
- [Part 8 — UI Docs Page](#part-8--ui-docs-page)

---

## Single Prompt — Copy and Paste Into Claude Code or Codex

```
Read AGENT.md completely, then execute all phases in Part 1 from start to finish.

Rules:
- Complete and verify each phase before starting the next
- If a verification fails, fix it before proceeding — never skip
- Work autonomously through all phases without waiting for input
- After each phase: report "✅ Phase X complete" then immediately start the next
- In Phase 1: scaffold using "." not "cf-app" — never create a subfolder
- In Phase 6: implement /ui-preview exactly as specified in AGENT.md Part 5
  → every component, every state, every variant must be present
- In Phase 8: implement /ui-docs exactly as specified in AGENT.md Part 8
  → Storybook-style reference with spec annotations per component
- /ui-preview = visual verification · /ui-docs = developer spec reference
- When all phases are done: report "✅ CF Design System fully implemented"
```

---

## Part 1 — Implementation Phases

### Phase 1 — Project Setup
**Read:** Nothing yet. Just run the commands.

**Option A — Starting from scratch (empty folder):**
```bash
npx create-next-app@latest . --typescript --tailwind --app
npm install lucide-react focus-trap-react
```

**Option B — Already have a Next.js project:**
```bash
npm install lucide-react focus-trap-react
```

> **Never run** `npx create-next-app@latest cf-app` — this creates an unwanted `cf-app/` subfolder. Always use `.` to scaffold into the current directory.

> **Before running any commands:** place `AGENT.md` and `cf-design-system.md` in the project root first. Future agent runs need these files locally to reference specs without re-downloading.

**Detect project structure after scaffolding:**
```bash
ls src 2>/dev/null && echo "SRC LAYOUT" || echo "ROOT LAYOUT"
```

**If SRC LAYOUT** (`src/app` and `src/components` exist):
```bash
mkdir -p src/components/ui src/components/patterns src/app/ui-preview
```

**If ROOT LAYOUT** (`app/` and `components/` at root):
```bash
mkdir -p components/ui components/patterns app/ui-preview
```

All imports use `@/components/ui` — works for both layouts as long as `tsconfig.json` paths are correct (`./src/*` for src layout, `./*` for root layout). Verify after scaffolding.

**Windows / PowerShell note:** Avoid regex with `\U` escape sequences. Use `-like` for path matching instead.

**Verify before continuing:**
```bash
npm run dev
# Must start on http://localhost:3000 with no errors
# Kill with Ctrl+C before proceeding
```
✅ Done when dev server runs clean and folder structure exists.

---

### Phase 2 — CSS Token Setup
**Read:** `cf-design-system.md` — jump to `## 1.5 Setup & Token Wiring` only.

Copy these 3 code blocks from that section into your project:
1. `globals.css` — replaces `app/globals.css`
2. `tailwind.config.ts` — replaces your config
3. `layout.tsx` — replaces `app/layout.tsx`

**Also create `next.config.ts`** with `images.remotePatterns` — see `cf-design-system.md` section 1.5 for the exact block. Required for Avatar photo type to load external images.

**Verify in browser DevTools console:**
```js
getComputedStyle(document.documentElement).getPropertyValue('--color-accent-default')
// Must return: " #2DD48F"
```
✅ Done when all 3 values return correctly. Page background must be dark (#0F1117).

---

### Phase 3 — Read Rules (Once)
**Read:** `AGENT.md` Part 2 (Rules) and Part 3 (Known Fixes) — right now, completely, before writing any component code.

✅ Done when you can answer from memory:
- What border radius do buttons use?
- What transition string goes on all interactive elements?
- Which component requires `focus-trap-react`?

---

### Phase 4 — Implement Components (One at a Time)
**Read:** For each component, jump to `#### ComponentName` in `cf-design-system.md` section 4.1. Read that section only. Copy the code. Apply fixes from Part 3. Run the per-file check from Part 4. Move to the next.

**Order (each group depends on the previous):**

```
Group A — No dependencies
  Divider · Spinner · Badge · Avatar

Group B — Form primitives
  Toggle · Checkbox · Radio · ProgressBar

Group C — Input controls
  InputField · Dropdown

Group D — Interactive
  Button · Tabs · NavItem

Group E — Feedback
  Skeleton · Toast · ToastContext · Alert · Tooltip

Group F — Overlays
  Popover · Modal

Group G — Data
  Table · FileUpload · Pagination

Group H — Utility
  Card · ErrorBoundary
```

After all components — create `components/ui/index.ts` barrel export.

**Verify:**
```bash
npm run build
# Zero TypeScript errors, zero build errors
```
✅ Done when build passes clean with all 25 files in `components/ui/`.

---

### Phase 5 — Implement Patterns
**Read:** Jump to `## 5. Patterns` in `cf-design-system.md`. Read each pattern section only.

```
Sidebar          → components/patterns/Sidebar.tsx
Toolbar          → components/patterns/Toolbar.tsx
FormLayout       → components/patterns/FormLayout.tsx
EmptyState       → components/patterns/EmptyState.tsx
CommunityCard    → components/patterns/CommunityCard.tsx
ComponentCard    → components/patterns/ComponentCard.tsx
```

**Verify:**
```bash
npm run build && npm run lint
# Zero errors, zero lint warnings
```

✅ Done when build, lint, and browser console all pass clean.

---

### Phase 6 — Visual Verification
**Read:** Part 5 of this file completely.

Create `app/ui-preview/page.tsx` using the layout structure and component list from Part 5.

✅ Done when every item in the visual checklist passes and matches the reference file.

---

### Phase 7 — UI Docs Page
**Read:** Part 8 of this file.

Create `app/ui-docs/page.tsx` using the code in Part 8. Visit `http://localhost:3000/ui-docs`.

✅ Done when `/ui-docs` loads and every component section shows correct spec annotations alongside rendered components.

---

### Phase 8 — Figma MCP Integration
**Read:** Part 6 of this file.

Use this phase every time a designer shares a new Figma design.
✅ Done when every Figma element maps to a CF component and build passes.

---

## Part 2 — Rules

> Read this once in Phase 3. These rules apply to every file you write.

### Stack
```
Framework:  Next.js latest (app router — app/ directory, not pages/)
Styling:    Tailwind CSS v4 — tokens via CSS vars, not theme.extend
Icons:      lucide-react ONLY
Fonts:      Inter + JetBrains Mono via next/font/google
Traps:      focus-trap-react (Modal only)
```
**Never install:** shadcn · radix-ui · headlessui · heroicons · react-icons

---

### Colors — Never Use Raw Hex
```
BACKGROUNDS (elevation order — never use same bg for parent + child)
--color-bg-page      #0F1117  →  page background
--color-bg-surface   #13151D  →  cards, sidebar, panels
--color-bg-overlay   #161923  →  dropdowns, menus, modal bg-content
--color-bg-raised    #1A1D27  →  hover states, active fills
--color-backdrop     rgba(0,0,0,0.6)  →  modal overlay

BORDERS
--color-border-muted  #222536  →  default borders on all elements
--color-border-focus  #363A52  →  focus rings, active inputs

TEXT
--color-text-primary    #F0F1F5  →  headings, labels, active
--color-text-secondary  #9899A8  →  body, descriptions
--color-text-tertiary   #5C5E72  →  placeholders, metadata (never for readable text)
--color-text-disabled   #3A3D52  →  disabled elements

ACCENT (brand — primary interactive elements only)
--color-accent-default  #2DD48F
--color-accent-hover    #1ABCAA
--color-accent-active   #0EA5E9
--color-accent-subtle   #0C2B2E
--color-accent-border   #1A4D6E

SEMANTIC
--color-danger-text    #F87171   --color-danger-bg     #1C0F0F
--color-danger-hover   #2A1010   --color-danger-border  #7F2020
--color-success-text   #4ADE80   --color-success-bg    #0C1F12
--color-warning-text   #FBBF24   --color-warning-bg    #1C160A
--color-info-text      #2DD48F   --color-info-bg       #0C2B2E
--color-neutral-text   #9899A8   --color-neutral-bg    #13151D
```

---

### Spacing — 4px Grid Only
```
4px   gap-1  p-1   → --space-tight   (icon gaps, tight fills)
8px   gap-2  p-2   → --space-inner   (component internals)
12px  gap-3  p-3
16px  gap-4  p-4   → --space-base    (default spacing)
20px  gap-5  p-5
24px  gap-6  p-6   → --space-section (between components)
48px  gap-12 p-12  → --space-layout  (between page sections)
64px  gap-16 p-16  → --space-page    (page margins)

Exception: gap-1.5 (6px) — allowed only for compact tab/toolbar icon+text
Forbidden: gap-7 · gap-8 · gap-9 · gap-11 · gap-14 (off-scale)
```

---

### Border Radius — Always Use Tokens
```
--radius-sharp  8px    → rounded-[var(--radius-sharp)]
  Use: inputs · dropdowns · nav items · tags · icon buttons · table wrap

--radius-base   12px   → rounded-[var(--radius-base)]
  Use: buttons · toast · popovers · toolbar · tabs container · pagination container

--radius-card   15px   → rounded-[var(--radius-card)]
  Use: cards · modals · panels · sidebar · form layout · empty state icon wrap

--radius-pill   9999px → rounded-[var(--radius-pill)]
  Use: badges · avatars · toggles · progress bar

NEVER use: rounded-xl · rounded-lg · rounded-md · rounded-2xl · rounded-3xl
```

---

### Component Exact Sizes
```
BUTTON
  sm  h-[36px] px-3  text-xs   font-medium  rounded-[var(--radius-base)]
  md  h-[42px] px-4  text-sm   font-medium  rounded-[var(--radius-base)]
  lg  h-[46px] px-5  text-sm   font-medium  rounded-[var(--radius-base)]
  icon-only: aspect-square px-0 (square)
  icon size: 16px · gap: gap-[var(--space-tight)]

INPUT / DROPDOWN
  md  h-[42px] px-3  text-sm   rounded-[var(--radius-sharp)]
  lg  h-[46px] px-3  text-sm   rounded-[var(--radius-sharp)]
  label: text-xs font-medium · gap to input: gap-1.5
  error/hint: text-[11px] below input

BADGE
  sm  px-2  py-0.5  text-[11px]  pill or sharp
  md  px-3  py-1    text-xs      pill or sharp

AVATAR
  sm  w-6 h-6  (24px)  text-[11px]  rounded-[var(--radius-pill)]
  md  w-8 h-8  (32px)  text-xs      rounded-[var(--radius-pill)]

MODAL
  max-w-[440px] · rounded-[var(--radius-card)]
  header: px-5 py-[18px] text-[15px] font-semibold
  body:   px-5 py-5 text-sm
  footer: px-5 py-3.5 justify-end gap-2

CARD
  rounded-[var(--radius-card)] · bg-[var(--color-bg-surface)]
  header/footer: px-4 py-3 · body: p-4

SIDEBAR
  expanded: 220px · collapsed: 52px
  transition: width 250ms ease
  height: h-screen

NAV ITEM
  h-9 (36px) · px-3 · gap-2.5 · rounded-[var(--radius-sharp)]

TABLE
  wrap: rounded-[var(--radius-base)]
  header: px-4 py-2.5 text-[11px] uppercase tracking-wide
  cell:   px-4 py-3 text-sm

PAGINATION
  page btn: w-8 h-8 (32px) rounded-[var(--radius-sharp)]
  container (inline): px-4 py-3 rounded-[var(--radius-base)]
  container (sticky): fixed bottom-0 border-top only

TOAST
  px-4 py-3.5 · rounded-[var(--radius-base)] · max-w-[360px]
  position: fixed bottom-6 right-6 z-[var(--z-toast)]
  auto-dismiss: 4000ms

PROGRESS BAR    h-[6px] · rounded-[var(--radius-pill)]
SPINNER         sm: w-[14px] h-[14px] · md: w-[20px] h-[20px] · border-2
TOOLTIP         px-2.5 py-1.5 · rounded-[var(--radius-sharp)] · text-xs
EMPTY STATE     px-8 py-12 · icon wrap: w-14 h-14 rounded-[var(--radius-card)]
FORM LAYOUT     max-w-640px · header: px-5 py-[18px] · body: px-5 py-5 gap-4
```

---

### Typography
```
text-[11px] → captions · hints · errors · table headers · badge-sm
text-xs     → form labels (12px) · badge-md
text-sm     → nav · dropdown · card body · tab labels (13-14px)
text-[15px] → modal title · form layout title
text-base   → emphasized body (16px)
text-lg     → section headings (18px, use sparingly)
text-2xl    → page headings (24px)
text-3xl    → hero only (32px)

font-normal   → body text
font-medium   → buttons · labels
font-semibold → headings · titles
font-bold     → hero headings only

Max 2 type sizes per component.
Never use: text-xl · text-4xl · text-5xl · text-[10px]
```

---

### Transitions
```
// All interactive elements — copy exactly:
'transition-[background,border-color,color] duration-150 ease'

// Focus — all interactive elements:
'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]'

// Disabled — all interactive elements:
'disabled:opacity-40 disabled:cursor-not-allowed'

// NEVER use: transition-all  or  ease-[ease]  (both invalid/too broad)
```

---

### Z-index — CSS Vars Only
```tsx
style={{ zIndex: 'var(--z-overlay)' }}   // 10 — sticky headers
style={{ zIndex: 'var(--z-dropdown)' }}  // 20 — dropdowns · popovers · tooltips
style={{ zIndex: 'var(--z-modal)' }}     // 30 — modals
style={{ zIndex: 'var(--z-toast)' }}     // 40 — toasts · sticky pagination

NEVER use: z-10 · z-20 · z-30 · z-40 · z-50 Tailwind classes
NEVER use: z-[var(--z-*)] Tailwind arbitrary class syntax — use style={{ zIndex: }} instead
```

---

### `use client` Directive
```
Required:   Dropdown · Modal · Popover · Tooltip · FileUpload
            Toast · ToastContext · Checkbox (useRef) · Sidebar
Not needed: Button · InputField · Card · Badge · NavItem · Tabs
            Toggle · Radio · Divider · Spinner · ProgressBar
            Alert · Avatar · Skeleton · Toolbar · FormLayout · EmptyState
```

---

### Accessibility
```
Icon-only buttons     → aria-label="Action name"
InputField            → <label> via htmlFor + useId()
InputField error      → aria-invalid="true" + aria-describedby
Modal                 → role="dialog" aria-modal="true" aria-labelledby
Active NavItem        → aria-current="page"
Toggle                → role="switch" aria-checked
Spinner               → role="status" aria-label="Loading"
Skeleton              → aria-hidden="true"
ProgressBar           → role="progressbar" aria-valuenow aria-valuemin aria-valuemax
Dropdown              → aria-expanded aria-haspopup="menu"
Alert                 → role="alert" aria-live="assertive"
Toast                 → role="status" aria-live="polite"
Focus trap required inside open modals (focus-trap-react)
```

---

### Imports
```tsx
// Always use barrel — never direct file path
import { Button, InputField, Badge } from '@/components/ui'
import { Sidebar } from '@/components/patterns/Sidebar'
import { FormLayout, FormSection } from '@/components/patterns/FormLayout'
```

### Token Authority

`cf-design-system.md` is the single source of truth for all tokens. If any local direction contradicts the MD — **the MD wins**.

---

### Color in Classnames vs Style Props

```tsx
// ✅ Correct — bg color as Tailwind arbitrary class
className="bg-[var(--color-bg-surface)]"

// ✅ Correct — z-index always as inline style
style={{ zIndex: 'var(--z-dropdown)' }}

// ✅ Correct — backdrop always as inline style
style={{ backgroundColor: 'var(--color-backdrop)', zIndex: 'var(--z-modal)' }}

// ❌ Wrong — z-index as Tailwind arbitrary class (gets purged)
className="z-[var(--z-dropdown)]"
```

---

### Never Use
```
rounded-xl · rounded-lg · rounded-md · rounded-2xl · rounded-3xl
ease-[ease] · transition-all
z-10 · z-20 · z-30 · z-40 · z-50 (as Tailwind classes)
z-[var(--z-*)] (arbitrary Tailwind z-index syntax)
bg-white · bg-black · text-white · text-black
#hex directly in className
gap-7 · gap-8 · gap-9 · gap-11 (off-scale)
shadcn · radix-ui · heroicons · react-icons · headlessui
value="..." on input without onChange — use defaultValue instead
primitives.tsx or utils.tsx catch-all files
```

---

## Part 3 — Known Code Fixes

> Apply these when copying component code from `cf-design-system.md`.

| Component | Fix |
|---|---|
| **Button iconOnly** | Never use `aspect-square px-0` for icon-only buttons. Use a separate `iconOnlySizeStyles` map with explicit `w-[N]px h-[N]px p-0` per size: sm=36px · md=42px · lg=46px |
| **InputField / all inputs** | Never use `value="..."` with a hardcoded string without an `onChange` handler. Use `defaultValue="..."` for uncontrolled display, or pair `value` with `onChange` for controlled inputs |
| **Card** | Add `flex flex-col` to Card root className · Add `flex-1` to CardBody className |
| **Alert** | Close icon is controlled by `onDismiss`, not by variant. In ui-preview, all 4 Alert variants must pass `onDismiss` |
| **Table** | Sorting is controlled — parent MUST manage `sortKey` + `sortDirection` state and sort `data` before passing |
| **Pagination** | Select element: use `pl-2 pr-6 appearance-none` for correct chevron spacing. Use `page` as React key, not index `i` |
| **ui-preview page** | Double scroll fix: root div must be `h-screen w-screen overflow-hidden` · right side must have `min-w-0` · main must be `overflow-y-auto overflow-x-hidden` · add `useEffect` to lock `document.documentElement` and `document.body` overflow on mount |
| **CommunityCard** | Remove all `-mt-2` negative margins — use consistent `gap-3` on parent flex container instead |
| **ToastContext / ErrorBoundary** | These live in `## 1.5 Setup` section, not in `## 4 Components`. Copy from there |
| **Checkbox** | Add `'use client'` at top — missing from source, causes hooks error |
| **Sidebar** | Add `h-screen` to root div className |
| **All components** | Replace `duration-[var(--duration-*)]` with hardcoded values: `--duration-base` → `duration-150`, `--duration-slow` → `duration-[250ms]`, `--duration-fast` → `duration-[100ms]` |
| **All components** | `LucideIcon` type → `React.ElementType` · Remove `import { type LucideIcon } from 'lucide-react'` |
| **Tooltip** | Arrow uses inline `style` object (not separate div) |
| **Button** | `ease-[ease]` → `ease` · `rounded-xl` → `rounded-[var(--radius-base)]` · `gap-1.5` → `gap-[var(--space-tight)]` |
| **InputField** | Icon position: use `top-1/2 -translate-y-1/2` (not `top-50% transform:`) |
| **Dropdown** | `aria-haspopup="listbox"` → `aria-haspopup="menu"` · Add `style={{ zIndex: 'var(--z-dropdown)' }}` to menu `<ul>` · Add `max-h-[300px] overflow-y-auto` to menu |
| **Modal** | Add `document.body.style.overflow = 'hidden'` in useEffect · backdrop: `style={{ backgroundColor: 'var(--color-backdrop)', zIndex: 'var(--z-modal)' }}` · Header divider is always `border-b border-[var(--color-border-muted)]` across all variants |
| **FileUpload** | ID: `` `file-${Date.now()}-${Math.random().toString(36).substr(2,9)}-${i}` `` |
| **Avatar** | `onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}` · Add `sizes` prop to Image |
| **Spinner** | `rounded-full` → `rounded-[var(--radius-pill)]` |
| **Toast container** | `z-40` → `style={{ zIndex: 'var(--z-toast)' }}` (in ToastContext.tsx) |

---

## Part 4 — Per-File Checklist

> Run this on every `.tsx` file you create or modify. No exceptions.

```
COLORS
⬜ Zero raw hex (#RRGGBB) in className or style
⬜ Zero bg-white · bg-black · text-white · text-black
⬜ Modal backdrop uses style={{ backgroundColor: 'var(--color-backdrop)' }}

RADIUS
⬜ Zero rounded-xl · rounded-lg · rounded-md · rounded-2xl · rounded-3xl
⬜ Inputs/dropdowns/nav → rounded-[var(--radius-sharp)]
⬜ Buttons/toast/popovers → rounded-[var(--radius-base)]
⬜ Cards/modals/panels → rounded-[var(--radius-card)]
⬜ Badges/avatars/toggles → rounded-[var(--radius-pill)]

SPACING
⬜ Zero off-scale: gap-7 · gap-8 · gap-9 · gap-11 · gap-14
⬜ All spacing on 4px grid (4/8/12/16/20/24/48/64px)

TYPOGRAPHY
⬜ Zero off-scale: text-xl · text-4xl · text-[10px]
⬜ Font weights: normal · medium · semibold · bold only

TRANSITIONS
⬜ Zero transition-all · ease-[ease]
⬜ Interactive elements have duration-150 ease

Z-INDEX
⬜ Zero z-20 · z-30 · z-40 · z-50 Tailwind classes
⬜ Zero z-[var(--z-*)] arbitrary Tailwind class syntax
⬜ Floating elements use style={{ zIndex: 'var(--z-*)' }}

ACCESSIBILITY
⬜ Every icon-only button has aria-label
⬜ Every InputField has label via htmlFor + useId()
⬜ Error inputs have aria-invalid + aria-describedby
⬜ Active NavItem has aria-current="page"

USE CLIENT
⬜ Present on: Dropdown · Modal · Popover · Tooltip · FileUpload · Toast · ToastContext · Checkbox · Sidebar
⬜ Absent on: Button · InputField · Card · Badge · NavItem · Tabs · Toggle · Radio · Divider

IMPORTS
⬜ UI components from @/components/ui only
⬜ Icons from lucide-react only
⬜ Zero shadcn · radix-ui · heroicons · react-icons
```

---

## Part 5 — UI Preview Page

> Create this in Phase 6. Implement from the spec in this section.

**File:** `app/ui-preview/page.tsx`
**Route:** `http://localhost:3000/ui-preview`

### Layout code structure

```tsx
// app/ui-preview/page.tsx — lock body scroll in useEffect
useEffect(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  return () => {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
}, [])
```

```tsx
return (
  <div className="flex h-screen w-screen bg-[var(--color-bg-page)] overflow-hidden">
    <div className="flex-shrink-0 overflow-hidden">
      <Sidebar ... />
    </div>
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <div className="flex-shrink-0 border-b border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] px-8 py-4" style={{ zIndex: 'var(--z-overlay)' }}>
        ...
      </div>
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-8 flex flex-col gap-12 pb-24">
        ...all sections...
      </main>
    </div>
    <Pagination variant="sticky" ... />
  </div>
)
```

### Visual checklist

```
Layout
✅ Sidebar fixed left 220px — never scrolls
✅ Topbar fixed at top
✅ Content scrolls independently
✅ Sticky pagination fixed at bottom

All sections present:
✅ Button — NO icons on variant row, sizes, states
✅ NavItem — standalone section, all 4 states
✅ InputField — required, optional, error, icon, hint
✅ Dropdown — closed + open with checkmark
✅ Card — default + interactive
✅ Badge — all 5 × pill md + sharp sm
✅ Form Controls — toggle + checkbox (incl. indeterminate) + radio
✅ Tabs — underline (incl. disabled tab) + pill
✅ Toolbar pattern
✅ Avatar + Spinner + Progress + Divider
✅ Skeleton — line + avatar+text + rect
✅ Alert — 4 variants, ALL with onDismiss
✅ Tooltip — bubble ABOVE arrow ABOVE button
✅ Popover menu + Toast
✅ FileUpload — dropzone + complete + uploading states
✅ Table — checkbox col + selected row + badge status
✅ Pagination inline
✅ Modal — Default + Warning + Danger (all 3 shown)
✅ Form Layout pattern
✅ Empty State pattern — 3 variants
✅ Sticky Pagination at bottom
```

---

## Part 6 — Figma MCP Integration

> Use this every time a designer shares a new Figma design. Run steps in order.

### Step 1 — Extract design elements
```
Using the Figma MCP tool, read the design at [figma-node-id].
List every UI element: Type, Size, Colors, Spacing, Border radius, Typography, Icon names.
Do not implement anything yet.
```

### Step 2 — Map to CF components
```
Map each element to a CF Design System component.
Flag any element with NO match.
Do not implement yet.
```

### Step 3 — Check token alignment
```
Map Figma values to CF tokens.
Flag any value that does not map to an existing token.
```

### Step 4 — Implement
```
Implement using only CF components mapped in Step 2.
Follow AGENT.md Part 2 rules exactly.
Run Part 4 checklist after each file.
```

### Step 5 — Verify
- `npm run build` — zero errors
- Visit the page, compare against Figma
- Run Part 4 checklist on every new file

---

## Part 7 — How to Prompt

### Claude Code (project files in repo root)
Place `AGENT.md` and `cf-design-system.md` in your project root. Claude Code reads `AGENT.md` automatically.

**Starting prompt:**
```
Read AGENT.md completely before writing any code.
Then follow the phases in Part 1 starting from [phase number].
Confirm you've read it by stating: the accent color, the button radius token, and the correct transition string.
```

**Per-component prompt:**
```
Read AGENT.md Part 2 and Part 3.
Then read the #### [ComponentName] section in cf-design-system.md section 4.1.
Implement the component, apply all fixes from Part 3, then run the Part 4 checklist.
```

### Quick verification
```
Scan all files in components/ui/ and components/patterns/ for:
1. rounded-xl · rounded-lg · rounded-md · rounded-2xl
2. ease-[ease] · transition-all
3. z-20 · z-30 · z-40 · z-50 (as Tailwind classes)
4. bg-white · bg-black · text-white · text-black
5. Raw hex (#RRGGBB) in className strings
6. Import from @radix-ui · shadcn · @heroicons
7. aria-haspopup="listbox"
8. Icon-only button without aria-label
9. InputField without a label prop

Report: file name · violation type · suggested fix.
```

---

## Part 8 — UI Docs Page (Storybook-style Reference)

> A developer reference page at `/ui-docs`. Shows every component with its props, sizes, tokens, and states annotated. Separate from `/ui-preview` which is for visual verification only.

**File:** `app/ui-docs/page.tsx`
**Route:** `http://localhost:3000/ui-docs`

---

*CF Design System v0.4.1*
