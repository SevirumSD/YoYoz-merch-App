---
name: motion-sections
description: Build and restyle animated sections of the YoYoz merch storefront against a locked design system. Use this whenever adding, redesigning, or animating any UI section or component in this repo — heroes, product grids, cards, drawers, modals, banners, page transitions — or whenever the user asks to make something look more premium, polished, expensive, or "less AI-generated," or mentions Framer Motion, scroll animations, hover effects, entrance animations, or visual consistency. Also use before shipping any visual change, to audit tokens and motion against the system.
---

# Motion Sections

Build sections that look designed rather than generated, and animate in a way that survives a mid-range phone.

## The one rule

**Read `design-system.md` before writing a single line of a component, and pass its values into everything you produce.**

The failure this prevents: component generation is happy to produce five beautiful sections that share no palette, no type scale, and no motion timing. Each looks fine alone; together they read as a collage. That incoherence is the actual difference between a site that looks expensive and one that looks like an AI made it — not the quality of any individual component.

If `design-system.md` does not exist yet, Phase 1 creates it. Do not skip ahead to building; a system nobody enforces is just a document.

If a value in the system genuinely does not work for a component, say so and change the system deliberately. Do not make a silent exception — silent exceptions are how the drift starts.

## What this repo already has

Check these before proposing installs or rewrites; getting them wrong wastes a turn and can break the build.

- **Framer Motion `^11.16.4` is already installed** and used across 13 files. Never `npm install framer-motion`.
- **Tailwind v3** with semantic CSS variables in `src/index.css`. Note the trap: `Layout.jsx` overrides `--background` and `--foreground` inline to pure black/white, so the light-mode `:root` values in `index.css` are dead for the storefront. Add new tokens in both places or they behave inconsistently.
- **Shadcn/Radix primitives** in `src/components/ui/`. ESLint and typecheck deliberately ignore this directory. Compose them; do not restyle them ad hoc, or you fork the primitive and the drift becomes invisible to lint.
- **Pages auto-register** from `src/pages/` via `pages.config.js`. That file is generated — only `mainPage` is hand-editable.
- **`Checkout` renders outside the layout wrapper** (`Layout.jsx` branches on `currentPageName === "Checkout"`). It has no nav, sidebar, or footer, so section work there needs its own framing.
- **Data arrives async** from Base44 through React Query. Components mount before data lands, which matters a lot for entrance animations — see the stagger trap below.

Two tools from the reference workflow are **not** connected in this session: the UI UX Pro Max skill and the 21st.dev Magic MCP. The workflow below is the part that carries the value and works without them. If the user installs them later, UI UX Pro Max slots into Phase 1 as the system generator and Magic MCP slots into Phase 2 as the component source — the enforcement discipline around them stays identical.

## Phase 1 — Lock the system

Run this once per project, or when the user wants to redirect the aesthetic.

This repo's system already exists implicitly. The token counts make it obvious: `text-white` (180), `text-red-500` (81), `bg-zinc-900` (78), `text-zinc-400` (65), `bg-red-600` (53), `bg-black` (41). The job here is **codification, not invention** — write down what the storefront already is, resolve the contradictions, and make it enforceable. Inventing a fresh palette would throw away a coherent look that already exists across seven pages.

Read the codebase first — `Layout.jsx`, `src/index.css`, `tailwind.config.js`, and two or three components in `src/components/store/` — then write `design-system.md` at the repo root with this structure:

```markdown
# Design System

## Palette
| Role | Token | Hex | Used for |
(surfaces, foreground, primary, accent, muted, borders — each with one stated job)

## Type scale
(font stack, and each step with size/weight/tracking/case — this app leans on
uppercase black-weight tracking for labels, so record that as a rule, not a vibe)

## Spacing scale
## Border radius
## Shadow scale

## Motion tier
(entrance duration, hover duration, easing, stagger step, stagger cap,
distance travelled — one tier for the whole site)

<!-- APPROVED-TOKENS-START -->
bg-black
bg-zinc-950
text-red-500
...one Tailwind class per line...
<!-- APPROVED-TOKENS-END -->
```

The `APPROVED-TOKENS` block is not decoration — `scripts/audit-tokens.sh` parses it to check the codebase against the system. Keep it complete and keep it accurate.

**Resolve contradictions rather than listing them.** Where the codebase disagrees with itself, pick the winner, record it, and note the losers as migrations. Two known ones to settle:

- `border-zinc-850` appears 22 times and **is not a real Tailwind shade** (the scale is 50–950 with no 850). Those borders currently render as nothing. Either define `zinc-850` in `tailwind.config.js` or migrate them to `border-zinc-800`. Decide, write it down.
- `bg-red-600` vs `bg-red-700` vs `text-red-500` vs `text-red-400` are doing overlapping work. Assign each a distinct job (surface / hover / accent text / hover text) or collapse them.

Confirm the system with the user before building against it. It is cheap to change now and expensive after twelve components inherit it.

## Phase 2 — Build a section

Work **one section at a time**, checking each against the previous. A single generation covering a whole page is where coherence dies — the model loses the thread partway and starts re-deriving choices it already made.

For each section, establish: what job the section does, what the real copy is (or an explicitly marked placeholder), and which values from `design-system.md` apply.

### Animation rules, and why they hold

- **Animate `transform` and `opacity` only.** These composite on the GPU. Animating `width`, `height`, `top`, or `margin` forces the browser to recalculate layout every frame — that is the specific reason motion-heavy AI-built sites feel fine on a laptop and janky on a real phone.
- **Respect `prefers-reduced-motion` on every animation.** This repo currently honors it in **zero** of 13 motion files, so this is the highest-value fix available here. It is an accessibility requirement for people with vestibular disorders, and an OS setting people actually turn on and notice.
- **Keep entrances under 600ms.** Past that, motion stops reading as polish and starts reading as lag.
- **Trigger on viewport, fire once.** Use `whileInView` with `viewport={{ once: true }}`, not `animate`. Two failure modes this closes: elements animating while off-screen, and elements re-animating every time the user scrolls back up.
- **Cap the stagger.** `delay: index * 0.05` is fine for six cards and broken for forty — the last card waits two seconds. Cap the multiplier (`Math.min(index, 8)`). `ProductCard.jsx:40-42` has this bug today, compounded by animating on mount: React Query delivers the whole product list at once, so every card mounts simultaneously and staggers through positions nobody is looking at.
- **Clean up on unmount.** Framer Motion's declarative props tear themselves down, but manual `animate()` calls, scroll listeners, and timeouts do not. This app uses React Router, so components unmount constantly and leaks compound across a session. When you add a preset, ask directly whether it cleans up on unmount — and if not, add that.

Copy-paste patterns for all of the above, written against this repo's components, are in `references/motion-patterns.md`. Read that file when writing motion code rather than deriving the patterns fresh.

## Phase 3 — Before calling it done

Run the audit:

```bash
bash .claude/skills/motion-sections/scripts/audit-tokens.sh
```

It checks four things deterministically: phantom Tailwind shades that silently render as nothing, tokens used but not approved in `design-system.md`, files importing Framer Motion without any reduced-motion handling, and likely layout-property animation. Fix what it reports, or consciously update the system.

Then the checks a script cannot make:

- **Load it on a real phone on cellular**, not the browser's device emulator. The gap between a laptop and a mid-range Android is widest exactly on motion-heavy pages, and emulators hide it completely.
- **Turn on reduced motion at the OS level and reload.** The site should still work and still look intentional — calmer, not broken. Elements that never appear mean an animation is missing its fallback.
- **Scroll fast, then scroll back up.** Animations that only behave on a slow, polite first pass are the single most common bug in this style of site.
- **Spot-check the finished page against `design-system.md`.** Anything on screen that is not in the system is a component that slipped it. That is what makes a page feel subtly off in a way people notice but cannot name.

Report honestly which of these you verified and which you could not — if you cannot drive a real phone, say so rather than implying the page was tested on one.
