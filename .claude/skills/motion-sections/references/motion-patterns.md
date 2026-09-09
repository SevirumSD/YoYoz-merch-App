# Motion patterns for this repo

Copy-paste patterns written against this codebase's actual stack (Framer Motion 11, Tailwind 3, Radix/Shadcn, React Router, React Query). Prefer these over deriving motion code fresh — consistency across sections is the whole point.

## Contents

1. The global reduced-motion floor (do this first)
2. Shared motion config — `src/lib/motion.js`
3. Viewport entrance
4. Staggered grids
5. Hover affordances
6. Overlays: Radix vs. custom
7. Manual animations and teardown
8. Worked example: fixing `ProductCard.jsx`

---

## 1. The global reduced-motion floor

Do this before anything else. It is one block of CSS and it covers every animation in the app at once — including the Radix/Shadcn primitives in `src/components/ui/`, which animate through `tailwindcss-animate` classes and do **not** respect `prefers-reduced-motion` on their own.

Without this, a user with reduced motion enabled still gets every dialog, sheet, dropdown, accordion, and toast animating at full strength, because those live in CSS you are not touching component by component.

Add to `src/index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is a floor, not a substitute for handling reduced motion in Framer Motion components — Framer drives transforms through inline styles in JS, which this CSS does not reach. Use it together with section 2.

---

## 2. Shared motion config — `src/lib/motion.js`

Create this file once and import it everywhere. Its job is to make the motion tier from `design-system.md` a single source of truth, so timing cannot drift component by component. It belongs in `src/lib/` alongside `query-client.js` and `utils.js`.

```js
import { useReducedMotion } from "framer-motion";

export const MOTION = {
  entrance: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  hover: { duration: 0.2, ease: "easeOut" },
  distance: 20,
  staggerStep: 0.05,
  staggerCap: 8,
};

export function useEntrance(index = 0) {
  const reduced = useReducedMotion();

  if (reduced) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: { once: true, amount: 0.2 },
      transition: { duration: 0.2 },
    };
  }

  return {
    initial: { opacity: 0, y: MOTION.distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: {
      ...MOTION.entrance,
      delay: Math.min(index, MOTION.staggerCap) * MOTION.staggerStep,
    },
  };
}

export function useHoverLift() {
  const reduced = useReducedMotion();
  return reduced ? {} : { whileHover: { y: -4 }, transition: MOTION.hover };
}
```

Two things worth understanding rather than copying blindly:

- `useReducedMotion` is called unconditionally before the branch, so the early return does not violate the rules of hooks. Keep that ordering if you extend these.
- Under reduced motion the opacity fade is kept and only the *movement* is dropped. Fades are not vestibular triggers; translation and scale are. Removing all feedback would make the UI feel broken rather than calm.

Values here should mirror the Motion tier in `design-system.md`. If you change one, change both.

---

## 3. Viewport entrance

```jsx
import { motion } from "framer-motion";
import { useEntrance } from "@/lib/motion";

export default function FeatureBlock() {
  return (
    <motion.section {...useEntrance()} className="...">
      ...
    </motion.section>
  );
}
```

`viewport={{ once: true }}` is doing real work: without it the element re-animates every time it re-enters the viewport, so scrolling up and down makes the page flicker. `amount: 0.2` fires when 20% is visible, which means the animation finishes while the element is still comfortably on screen rather than completing after the user has scrolled past it.

---

## 4. Staggered grids

```jsx
{products.map((product, index) => (
  <motion.div key={product.id} {...useEntrance(index)}>
    <ProductCard product={product} />
  </motion.div>
))}
```

The cap inside `useEntrance` is the important part. Uncapped, `index * 0.05` on a 40-product Shop grid leaves the last card waiting two full seconds — and because React Query delivers the whole list in one go, every card mounts at the same instant, so that delay is pure dead time on content the user may already have scrolled to. Capping at 8 keeps the staggered feel for the first row or two and lets everything after that arrive promptly.

---

## 5. Hover affordances

```jsx
import { motion } from "framer-motion";
import { useHoverLift } from "@/lib/motion";

<motion.article
  {...useHoverLift()}
  className="border border-zinc-800 hover:border-red-600/60 transition-colors"
>
```

Split the work deliberately: movement goes through Framer (so it can be disabled under reduced motion), while color and border changes stay in Tailwind's `transition-colors` (so the affordance survives when movement is off). A card that gives no feedback at all under reduced motion reads as a dead control.

Touch devices have no hover state, so never let a hover transition be the only thing revealing information — price, title, and the tap target must be visible at rest.

---

## 6. Overlays: Radix vs. custom

**Radix-based** (`Sheet`, `Dialog`, `DropdownMenu` from `src/components/ui/`) already animate via `tailwindcss-animate` data-attribute classes. Do not wrap them in Framer Motion — you get two animation systems fighting over the same element, and the exit animation usually loses. `CartDrawer` and the sidebar in `Layout.jsx` are on this path. Their reduced-motion handling comes from the global CSS floor in section 1.

**Custom overlays** you build yourself need `AnimatePresence` so the exit animation runs before unmount:

```jsx
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MOTION } from "@/lib/motion";

export default function ImageOverlay({ isOpen, onClose, children }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={MOTION.entrance}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Scale from `0.96`, not `0.8` — large scale jumps on a full-screen overlay are exactly the motion that triggers discomfort, and they read as cheap.

---

## 7. Manual animations and teardown

Framer's declarative props clean themselves up when the component unmounts. These do not, and this app unmounts components constantly because every route change swaps the page:

```jsx
useEffect(() => {
  const onScroll = () => { /* ... */ };
  window.addEventListener("scroll", onScroll, { passive: true });
  const timer = setTimeout(() => setReady(true), 300);

  return () => {
    window.removeEventListener("scroll", onScroll);
    clearTimeout(timer);
  };
}, []);
```

Anything imperative — `animate()` from `framer-motion`, `requestAnimationFrame` loops, `setInterval`, scroll and resize listeners, `IntersectionObserver` — needs a matching teardown in the effect's return. On a single long landing page a leak is invisible; across a shopping session that bounces between Shop, ProductDetail, and Cart, leaks accumulate into real jank.

`Layout.jsx:54-58` is a good existing example of the pattern — the `cart-updated` listener is registered and removed correctly.

---

## 8. Worked example: fixing `ProductCard.jsx`

Current, at lines 40–42:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05, duration: 0.4 }}
>
```

Three defects, in order of severity:

1. **No reduced-motion fallback** — the movement runs regardless of the user's OS setting.
2. **`animate` instead of `whileInView`** — fires on mount, so cards far below the fold animate where nobody can see them, and the effect is spent by the time the user scrolls down.
3. **Uncapped stagger** — the last card in a long grid waits seconds for content that is already on screen.

Fixed:

```jsx
import { motion } from "framer-motion";
import { useEntrance } from "@/lib/motion";

<motion.div {...useEntrance(index)}>
```

All three defects close at once, the timing now comes from `design-system.md` through `src/lib/motion.js`, and the component gets shorter. That is the shape a good fix takes here — less local cleverness, more shared system.
