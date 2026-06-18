# RINGS Brand Guidelines

RINGS is a local-first personal vault. Every design decision reinforces warmth, calm, and editorial craft. The visual language draws from print design and stationery rather than SaaS dashboards.

---

## 1. Color System

### Light Mode

| Token        | Value     | Usage                                  |
|--------------|-----------|----------------------------------------|
| `background` | `#f9f8f6` | App canvas, page background            |
| `foreground` | `#1a1a1a` | Primary text, icons                    |
| `accent`     | `#6b7c3f` | Buttons, active states, links          |
| `border`     | `#e5e0d8` | Dividers, input borders, card outlines |
| `surface`    | `#ffffff` | Cards, modals, popovers               |
| `error`      | `#dc2626` | Destructive actions, validation errors |
| `success`    | `#16a34a` | Confirmations, saved states            |
| `warning`    | `#d97706` | Caution banners, unsaved indicators    |

Accent at 10% opacity (`rgba(107, 124, 63, 0.10)`) serves as a subtle highlight fill for selected rows, active pills, and hover backgrounds.

### Dark Mode

| Token        | Value     | Notes                                      |
|--------------|-----------|--------------------------------------------|
| `background` | `#1a1917` | Warm charcoal, not pure black              |
| `foreground` | `#e8e6e1` | Off-white, easy on the eyes                |
| `accent`     | `#8fa04f` | Lightened olive for WCAG AA on dark ground |
| `surface`    | `#2a2825` | Cards, modals                              |
| `border`     | `#3d3a35` | Subtle warm separation                     |
| `error`      | `#ef4444` | Brightened for dark contrast               |
| `success`    | `#22c55e` | Brightened for dark contrast               |
| `warning`    | `#f59e0b` | Brightened for dark contrast               |

Never use pure black (`#000000`) as a background or pure white (`#ffffff`) as text in dark mode. Keep the warmth.

---

## 2. Typography

**Typeface:** Roboto Serif Variable (imported via `@fontsource-variable/roboto-serif`).

Every text element in the app uses this single serif family. No sans-serif fallbacks in visible UI.

### Scale

| Role      | Size        | Weight       | Tracking      | Line Height |
|-----------|-------------|--------------|---------------|-------------|
| Display   | 32 - 48 px  | `font-light` (300)   | `tracking-tight` (-0.025em) | 1.1 |
| Heading   | 20 - 24 px  | `font-normal` (400)  | Normal        | 1.3         |
| Body      | 16 - 18 px  | `font-light` (300)   | Normal        | 1.6         |
| Caption   | 12 - 14 px  | `font-normal` (400)  | Normal        | 1.4         |
| UI Label  | 14 px       | `font-normal` (400)  | Normal        | 1.0         |

### Usage Rules

- Display is reserved for page titles and empty-state hero text. One per view maximum.
- Headings never stack without body text between them.
- Captions use `text-stone-500` in light mode, `text-stone-400` in dark mode.
- UI Labels appear on buttons, tabs, and form labels. They stay at 14 px regardless of viewport.

---

## 3. Spacing

Base unit: **8 px**. All spacing derives from this grid.

| Token | Value | Common Use                     |
|-------|-------|--------------------------------|
| `1`   | 4 px  | Icon-to-label gap, tight pairs |
| `2`   | 8 px  | Inline padding, small gaps     |
| `3`   | 12 px | Input padding, list item gap   |
| `4`   | 16 px | Card padding, section gap      |
| `6`   | 24 px | Between card groups             |
| `8`   | 32 px | Page section breaks             |
| `12`  | 48 px | Major layout regions            |
| `16`  | 64 px | Page-level top/bottom margins   |

Padding inside interactive elements (buttons, inputs) uses 12 px vertical, 16 px horizontal as the default.

---

## 4. Border Radius

| Token  | Value    | Use                                        |
|--------|----------|--------------------------------------------|
| `sm`   | 8 px     | Inputs, small buttons, tooltips            |
| `md`   | 12 px    | Dropdowns, popovers, chips                 |
| `lg`   | 16 px    | Cards, dialogs (inner content regions)     |
| `xl`   | 24 px    | Modals, large cards (`rounded-3xl`)        |
| `full` | 9999 px  | Pills, avatars, toggle knobs               |

Corner radii should feel soft and approachable. When nesting rounded elements (e.g. a button inside a card), the inner radius should be the outer radius minus the padding between them, so curves stay concentric.

---

## 5. Shadows

All shadows use warm stone-900 tones, never pure black.

| Token   | Value                                          | Use                       |
|---------|-------------------------------------------------|---------------------------|
| `sm`    | `0 1px 2px rgba(28, 25, 23, 0.05)`             | Inputs, subtle elevation  |
| `md`    | `0 4px 12px rgba(28, 25, 23, 0.08)`            | Cards at rest             |
| `lg`    | `0 8px 24px rgba(28, 25, 23, 0.12)`            | Cards on hover, modals    |
| `inset` | `inset 0 2px 4px rgba(255, 255, 255, 0.6)`     | Accent button inner glow  |

### Dark Mode Shadows

In dark mode, shadows shift to lower opacity since the base is already dark:

| Token   | Value                                          |
|---------|-------------------------------------------------|
| `sm`    | `0 1px 2px rgba(0, 0, 0, 0.15)`               |
| `md`    | `0 4px 12px rgba(0, 0, 0, 0.25)`              |
| `lg`    | `0 8px 24px rgba(0, 0, 0, 0.35)`              |
| `inset` | `inset 0 2px 4px rgba(255, 255, 255, 0.05)`   |

---

## 6. Motion

Animation must feel calm and intentional. Nothing should bounce or overshoot.

### Duration Tiers

| Name      | Duration | Easing                                  | Use                                     |
|-----------|----------|-----------------------------------------|-----------------------------------------|
| Snap      | 100 ms   | `ease`                                  | Button press feedback, checkbox toggle  |
| Micro     | 200 ms   | `ease`                                  | Hover states, tooltip appear, icon swap |
| Page      | 300 ms   | `cubic-bezier(0.16, 1, 0.3, 1)`        | Page transitions, modal open/close      |
| Emphasis  | 600 ms   | `cubic-bezier(0.16, 1, 0.3, 1)`        | Success checkmark, save confirmation    |

### Spring Physics (for Motion library)

Used on interactive press states (cards, buttons with tactile feel):

- **Stiffness:** 300 - 500
- **Damping:** 25 - 35
- **Mass:** 1 (default)

Higher stiffness for small elements (buttons), lower for larger surfaces (cards).

### Rules

- **GPU-only properties:** Only animate `transform` and `opacity`. Never animate `width`, `height`, `padding`, `margin`, or `border-width`.
- **Stagger:** When animating lists, delay each child by +50 ms, capped at ~200 ms total offset (i.e. 4 visible children). Items beyond the cap appear simultaneously.
- **Reduced motion:** Respect `prefers-reduced-motion`. Replace all transitions with instant state changes (0 ms duration). Keep opacity fades at 100 ms maximum.
- **Entry pattern:** Elements enter by fading in (opacity 0 to 1) with a subtle upward translate (8-12 px). No scale animations on entry.
- **Exit pattern:** Fade out with slight downward translate. Faster than entry (use Micro timing for exits).

---

## 7. Iconography

**Library:** HugeIcons (`@hugeicons/react` with `@hugeicons/core-free-icons`).

| Property     | Value   |
|--------------|---------|
| Stroke width | 1.5     |
| Size 16 px   | Inline with captions, tight UI |
| Size 20 px   | Buttons, inputs, nav items     |
| Size 24 px   | Page headers, empty states     |

### Rules

- Icons inherit `currentColor` from their parent. Never hardcode icon colors.
- Corner treatment on icons should feel consistent with the radius tokens. Prefer rounded-corner icon variants.
- Icons in buttons sit before the label with a 4 px gap (`gap-1`).
- Standalone icon buttons require a visible tooltip on hover and an `aria-label`.

---

## 8. Component Patterns

### Buttons

**Primary (accent):**
- Background: `accent`
- Text: `#ffffff`
- Shadow: `inset 0 2px 4px rgba(255, 255, 255, 0.6)` (inner glow)
- Radius: `sm` (8 px)
- Hover: Darken background 8%, elevate shadow to `md`
- Press: Scale to 0.97 via spring, remove outer shadow

**Secondary:**
- Background: transparent
- Border: `border` token, 1 px
- Text: `foreground`
- Hover: Background fills with `accent` at 10% opacity
- Press: Same spring scale as primary

**Destructive:**
- Same structure as primary, background uses `error` token
- Inset shadow uses `rgba(255, 255, 255, 0.4)`

### Inputs

- Style: Bottom-border only (no full outline by default)
- Border color: `border` token, transitioning to `accent` on focus
- Background: transparent
- Padding: 12 px vertical, 0 horizontal (bottom-border style needs no side padding)
- Label: UI Label size, positioned above with 4 px gap
- Error state: Border becomes `error`, helper text in `error` color below

### Cards

- Background: `surface`
- Radius: `xl` (24 px) -- `rounded-3xl`
- Shadow: `md` at rest, `lg` on hover
- Padding: 24 px (`p-6`)
- Hover transition: Micro timing (200 ms) on shadow and subtle -2 px translateY
- Cards should not have visible borders unless they are in a dense grid. Shadows provide sufficient separation.

### Modals

- Overlay: `rgba(0, 0, 0, 0.4)` with `backdrop-blur-sm` (4 px blur)
- Container radius: `xl` (24 px) -- `rounded-3xl`
- Shadow: `lg`
- Entry: Fade in overlay (Page timing), scale modal from 0.96 to 1.0 with opacity
- Max width: 480 px for forms, 640 px for content-heavy dialogs
- Padding: 32 px (`p-8`)
- Close button: Top-right icon button, 32 px from edges

### Pills / Chips

- Radius: `full` (9999 px)
- Padding: 4 px vertical, 12 px horizontal
- Default: `border` color outline, `foreground` text
- Active: `accent` border, `accent` text, `accent` at 10% background fill
- Transition: Micro timing on border and background color

### Toggles

- Track: 40 px wide, 24 px tall, `full` radius
- Knob: 20 px circle, 2 px inset from track edge
- Off state: Track uses `border` color, knob uses `foreground` at 30%
- On state: Track uses `accent`, knob uses `#ffffff`
- Animation: Spring physics (stiffness 400, damping 30) on knob translateX

---

## 9. Dark Mode

Dark mode is a full token swap, not a filter or inversion.

### Token Mapping Summary

| Token        | Light       | Dark        |
|--------------|-------------|-------------|
| `background` | `#f9f8f6`   | `#1a1917`   |
| `foreground` | `#1a1a1a`   | `#e8e6e1`   |
| `accent`     | `#6b7c3f`   | `#8fa04f`   |
| `border`     | `#e5e0d8`   | `#3d3a35`   |
| `surface`    | `#ffffff`   | `#2a2825`   |

### Contrast Requirements

- All text must meet WCAG AA (4.5:1 for body text, 3:1 for large text).
- `#8fa04f` on `#1a1917` achieves approximately 5.2:1 contrast.
- `#8fa04f` on `#2a2825` achieves approximately 4.6:1 contrast.
- Accent text on surface backgrounds in dark mode passes AA at both sizes.

### Behavioral Rules

- Follow the system preference by default. Allow a manual override stored locally.
- Transition between modes with a 200 ms cross-fade on the `background-color` of `<body>`.
- Images and illustrations do not invert. If an illustration uses light-mode-specific colors, provide a dark variant.

---

## 10. Do / Don't

### Do

- Use warm-tinted shadows (`stone-900` base). They blend into the warm canvas.
- Use Roboto Serif for everything. The serif voice is core to the brand identity.
- Use generously rounded shapes (`rounded-3xl` for cards, `rounded-full` for pills).
- Use subtle, purposeful animations. Motion should reassure, not entertain.
- Use the olive accent sparingly. It carries more weight when it is rare.
- Use bottom-border inputs. They feel lighter and more editorial than boxed inputs.
- Use adequate whitespace. Dense UI contradicts the calm, personal-journal feel.

### Don't

- Use pure black shadows (`rgba(0, 0, 0, ...)`). They look cold on the warm palette.
- Use Inter, system-ui, or any sans-serif font in the UI.
- Use sharp corners (`rounded-none` or values below 8 px).
- Use bouncy or springy overshooting motion. Keep damping high enough to avoid oscillation.
- Use purple gradients, blue accent colors, or any saturated neon tones.
- Use pure white (`#ffffff`) as a background in dark mode. It blinds and breaks the warmth.
- Use decorative borders everywhere. Let shadows and spacing create hierarchy.
- Animate layout properties (`width`, `height`, `padding`). Use `transform` and `opacity` only.
