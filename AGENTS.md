<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:design-system-rules -->
# Design System Rules — Mandatory

This project has a design system defined in `AGENT.md` (rules/checklist) and `tr-design-system.md` (tokens/component code — source of truth). Before writing or editing any UI code (components, pages, styling), read `AGENT.md` Part 2 (Rules) and Part 3 (Known Fixes) in full. Every `.tsx` file you touch must pass the Part 4 checklist: no raw hex colors, no off-token Tailwind classes (`rounded-lg`, `bg-gray-*`, `shadow-md`, etc.), tokens only via `var(--color-*)` / `var(--radius-*)` / `var(--space-*)`, and reuse existing `components/ui` / `components/patterns` before building anything new. If `tr-design-system.md` conflicts with anything else, `tr-design-system.md` wins.
<!-- END:design-system-rules -->
