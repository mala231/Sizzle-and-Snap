# UI Context — Sizzle & Snap Design System

**Brand Personality:** High-energy, appetizing, unapologetically bold. Bridges street-food urgency with a premium digital experience.
**Design Style:** Corporate Modern with a High-Contrast edge — large typography, vibrant palette, structured grid, generous white space.
**Font Stack:** Plus Jakarta Sans (headlines) + Inter (body/UI) via Google Fonts.

---

## Color Tokens

### Primary Palette

| Token Name | Hex | Usage |
|---|---|---|
| `--color-primary` | `#a20000` | Brand identity, nav accents, links |
| `--color-primary-container` | `#d00000` | Primary buttons, CTAs, price highlights |
| `--color-on-primary` | `#ffffff` | Text/icons on primary buttons |
| `--color-on-primary-container` | `#ffded9` | Text on primary-container backgrounds |
| `--color-primary-fixed` | `#ffdad4` | Subtle primary tinted backgrounds |
| `--color-primary-fixed-dim` | `#ffb4a8` | Hover states on primary-fixed surfaces |
| `--color-on-primary-fixed` | `#410000` | Text on primary-fixed backgrounds |
| `--color-on-primary-fixed-variant` | `#930000` | Secondary text on primary-fixed backgrounds |
| `--color-inverse-primary` | `#ffb4a8` | Primary elements on dark/inverse surfaces |

### Secondary Palette (Orange — Promotional)

| Token Name | Hex | Usage |
|---|---|---|
| `--color-secondary` | `#904d00` | Secondary buttons, section labels |
| `--color-secondary-container` | `#fd8b00` | Promotional banners, secondary CTAs |
| `--color-on-secondary` | `#ffffff` | Text/icons on secondary buttons |
| `--color-on-secondary-container` | `#603100` | Text on secondary-container backgrounds |
| `--color-secondary-fixed` | `#ffdcc3` | Subtle orange tinted backgrounds |
| `--color-secondary-fixed-dim` | `#ffb77d` | Hover on secondary-fixed |
| `--color-on-secondary-fixed` | `#2f1500` | Text on secondary-fixed |
| `--color-on-secondary-fixed-variant` | `#6e3900` | Secondary text on secondary-fixed |

### Tertiary Palette (Yellow — Accent)

| Token Name | Hex | Usage |
|---|---|---|
| `--color-tertiary` | `#705d00` | Star ratings text, badge borders |
| `--color-tertiary-container` | `#c9a900` | Rating badges, "special" chips, food card price tags |
| `--color-on-tertiary` | `#ffffff` | Text on tertiary buttons |
| `--color-on-tertiary-container` | `#4c3e00` | Text on tertiary-container backgrounds |
| `--color-tertiary-fixed` | `#ffe16d` | Subtle yellow highlight backgrounds |
| `--color-tertiary-fixed-dim` | `#e9c400` | Hover on tertiary-fixed |
| `--color-on-tertiary-fixed` | `#221b00` | Text on tertiary-fixed |
| `--color-on-tertiary-fixed-variant` | `#544600` | Secondary text on tertiary-fixed |

### Surface & Background (Light Mode)

| Token Name | Hex | Usage |
|---|---|---|
| `--color-background` | `#fcf9f8` | Page background |
| `--color-on-background` | `#1c1b1b` | Primary text on page background |
| `--color-surface` | `#fcf9f8` | Default surface (same as background) |
| `--color-surface-dim` | `#dcd9d9` | Dimmed surfaces, disabled areas |
| `--color-surface-bright` | `#fcf9f8` | Elevated bright surfaces |
| `--color-surface-container-lowest` | `#ffffff` | Cards that need to pop above background |
| `--color-surface-container-low` | `#f6f3f2` | Subtle card backgrounds |
| `--color-surface-container` | `#f0edec` | Standard card / panel backgrounds |
| `--color-surface-container-high` | `#ebe7e7` | Input field fills, table row alternates |
| `--color-surface-container-highest` | `#e5e2e1` | Strongest container, chip backgrounds |
| `--color-surface-variant` | `#e5e2e1` | Outlined chip/card alternative surfaces |
| `--color-surface-tint` | `#c00000` | Tint applied to elevated surfaces in Material style |
| `--color-on-surface` | `#1c1b1b` | Primary text on any surface |
| `--color-on-surface-variant` | `#5e3f3a` | Secondary/muted text on surfaces |
| `--color-inverse-surface` | `#313030` | Dark surface for tooltips, snackbars |
| `--color-inverse-on-surface` | `#f3f0ef` | Text on inverse-surface |

### Dark Mode — Surface Overrides

| Token Name | Hex | Usage |
|---|---|---|
| `--color-dark-background` | `#121212` | Page background in dark mode |
| `--color-dark-surface` | `#1e1e1e` | Card and panel backgrounds in dark mode |
| `--color-dark-surface-container` | `#2c2c2c` | Elevated card, modal backgrounds |
| `--color-dark-surface-container-high` | `#3a3a3a` | Input fills, table headers |
| `--color-dark-on-surface` | `#e5e2e1` | Primary text in dark mode |
| `--color-dark-on-surface-variant` | `#c4a9a4` | Secondary/muted text in dark mode |
| `--color-dark-outline` | `#6b4f4a` | Border/divider in dark mode |
| `--color-dark-inverse-surface` | `#f3f0ef` | Light surface in dark mode contexts |

### Outline & Border

| Token Name | Hex | Usage |
|---|---|---|
| `--color-outline` | `#936e69` | Input borders, card outlines, dividers |
| `--color-outline-variant` | `#e8bdb6` | Subtle borders, inactive tab underlines |

### Error & Feedback

| Token Name | Hex | Usage |
|---|---|---|
| `--color-error` | `#ba1a1a` | Error text, destructive action labels |
| `--color-error-container` | `#ffdad6` | Error message backgrounds |
| `--color-on-error` | `#ffffff` | Text on error buttons |
| `--color-on-error-container` | `#93000a` | Text inside error containers |

### Semantic Status Tokens (Admin Dashboard)

| Token Name | Hex | Usage |
|---|---|---|
| `--color-status-pending` | `#fd8b00` | "Pending" order pip / badge |
| `--color-status-pending-bg` | `#ffdcc3` | Pending badge background |
| `--color-status-ready` | `#1a6b2a` | "Ready" order pip / badge |
| `--color-status-ready-bg` | `#c8f0d2` | Ready badge background |
| `--color-status-completed` | `#3a3a3a` | "Completed" order pip / badge |
| `--color-status-completed-bg` | `#e5e2e1` | Completed badge background |
| `--color-status-sold-out` | `#ba1a1a` | "Sold Out" overlay text |
| `--color-status-sold-out-bg` | `#ffdad6` | "Sold Out" chip background |
| `--color-status-open` | `#1a6b2a` | Shop "Open" indicator |
| `--color-status-closed` | `#ba1a1a` | Shop "Closed" indicator/banner |

### Accent Variants (Derived)

| Token Name | Hex | Usage |
|---|---|---|
| `--color-accent-red-subtle` | `#fff0ee` | Hover fill on white surfaces (primary tint) |
| `--color-accent-orange-subtle` | `#fff5ec` | Hover fill for secondary actions |
| `--color-accent-yellow-subtle` | `#fffbe6` | Rating star hover background |
| `--color-accent-overlay` | `rgba(162,0,0,0.08)` | Pressed/active state overlay on interactive elements |
| `--color-scrim` | `rgba(0,0,0,0.40)` | Modal backdrop, bottom-sheet overlay |
| `--color-blur-surface` | `rgba(252,249,248,0.80)` | Bottom nav bar blur background (light mode) |
| `--color-blur-surface-dark` | `rgba(30,30,30,0.85)` | Bottom nav bar blur background (dark mode) |

---

## Typography

### Font Families

| Token Name | Value | Usage |
|---|---|---|
| `--font-display` | `'Plus Jakarta Sans', sans-serif` | All headings, display text, price labels |
| `--font-body` | `'Inter', sans-serif` | Body copy, UI labels, form fields, table data |

> **Google Fonts import:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap`

### Type Scale

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `--text-display-lg` | Plus Jakarta Sans | 48px | 800 | 56px | -0.02em | Hero section headline (desktop) |
| `--text-display-lg-mobile` | Plus Jakarta Sans | 36px | 800 | 44px | -0.02em | Hero section headline (mobile) |
| `--text-headline-lg` | Plus Jakarta Sans | 32px | 700 | 40px | 0 | Section titles, page headings (desktop) |
| `--text-headline-lg-mobile` | Plus Jakarta Sans | 24px | 700 | 32px | 0 | Section titles (mobile) |
| `--text-title-md` | Plus Jakarta Sans | 20px | 600 | 28px | 0 | Card titles, modal headers, sidebar nav items |
| `--text-body-lg` | Inter | 18px | 400 | 28px | 0 | Long-form descriptions, landing page body |
| `--text-body-md` | Inter | 16px | 400 | 24px | 0 | Standard body text, form field values |
| `--text-label-md` | Inter | 14px | 600 | 20px | 0 | Button labels, chip labels, table column headers |
| `--text-label-sm` | Inter | 12px | 500 | 16px | 0 | Tags, timestamps, helper text, status pips |

---

## Border Radius Scale

| Token Name | Value | Usage |
|---|---|---|
| `--radius-sm` | `0.25rem` (4px) | Checkboxes, small badges, tooltip corners |
| `--radius-default` | `0.5rem` (8px) | Input fields, small buttons, image thumbnails |
| `--radius-md` | `0.75rem` (12px) | Dropdown menus, notification cards |
| `--radius-lg` | `1rem` (16px) | Standard cards (admin table rows, order cards) |
| `--radius-xl` | `1.5rem` (24px) | Food cards, primary buttons, hero banners |
| `--radius-full` | `9999px` | Pills, quantity steppers, circular avatars, status pips |

---

## Spacing Scale

| Token Name | Value | Usage |
|---|---|---|
| `--space-xs` | `4px` | Icon-to-label gap, tight inline spacing |
| `--space-sm` | `8px` | Inner chip padding, between stacked labels |
| `--space-md` | `16px` | Card inner padding (mobile), form field padding |
| `--space-lg` | `24px` | Card inner padding (desktop), between form rows |
| `--space-xl` | `32px` | Section header spacing, above section dividers |
| `--space-2xl` | `48px` | Between major page sections |
| `--space-3xl` | `64px` | Hero section vertical padding |
| `--space-container-mobile` | `16px` | Page edge margin on mobile |
| `--space-container-desktop` | `40px` | Page edge margin on desktop |
| `--space-gutter` | `20px` | Gap between grid columns |

---

## Elevation & Shadow Scale

| Level | Token Name | CSS Value | Usage |
|---|---|---|---|
| 0 — Floor | `--shadow-none` | `none` | Flat background, page base |
| 1 — Card | `--shadow-card` | `0px 4px 20px rgba(0,0,0,0.05), 0px 0px 0px 1px #eeeeee` | Food cards, form panels (light mode) |
| 1 — Card Dark | `--shadow-card-dark` | `0px 4px 20px rgba(10,8,30,0.18), 0px 0px 0px 1px #2c2c2c` | Cards in dark mode (indigo-tinted shadow) |
| 2 — Hover | `--shadow-hover` | `0px 8px 32px rgba(0,0,0,0.10), 0px 0px 0px 1px #e0e0e0` | Card hover state (paired with `translateY(-2px)`) |
| 3 — Modal | `--shadow-modal` | `0px 24px 64px rgba(0,0,0,0.18)` | Modals, bottom sheets, command palettes |

---

## Component Specifications

### Primary Button
| Property | Value |
|---|---|
| Background | `--color-primary-container` (#d00000) |
| Text | `--color-on-primary` (#ffffff) |
| Font | `--text-label-md` (Inter 14px 600) |
| Border Radius | `--radius-xl` (24px) |
| Padding | `12px 24px` |
| Hover | `--color-primary` (#a20000), `--shadow-hover` |
| Press animation | `scale(0.96)` 80ms ease |

### Secondary Button
| Property | Value |
|---|---|
| Background | `transparent` |
| Border | `1.5px solid --color-outline` (#936e69) |
| Text | `--color-primary` (#a20000) |
| Border Radius | `--radius-xl` (24px) |
| Hover | Background `--color-accent-red-subtle` |

### Food Card
| Property | Value |
|---|---|
| Background | `--color-surface-container-lowest` (#ffffff) |
| Border Radius | `--radius-xl` (24px) |
| Shadow | `--shadow-card` |
| Image | Full-bleed top image, 200px height, top radius matches card |
| Price Tag | Background `--color-tertiary-fixed` (#ffe16d), text `--color-on-tertiary-fixed` (#221b00), `--radius-full`, absolute positioned top-right |
| Hover | `--shadow-hover`, `translateY(-2px)` transition 200ms ease |
| Sold Out Overlay | Semi-transparent `rgba(0,0,0,0.45)` overlay, "SOLD OUT" in `--text-label-md`, `--color-status-sold-out` text |

### Input Field
| Property | Value |
|---|---|
| Background | `--color-surface-container-high` (#ebe7e7) |
| Border | `1px solid --color-outline-variant` (#e8bdb6) |
| Border Radius | `--radius-default` (8px) |
| Padding | `14px 16px` |
| Font | `--text-body-md` (Inter 16px 400) |
| Focus Border | `2px solid --color-secondary-container` (#fd8b00) |
| Error Border | `2px solid --color-error` (#ba1a1a) |

### Category Chip
| Property | Value |
|---|---|
| Background (inactive) | `--color-surface-container-highest` (#e5e2e1) |
| Text (inactive) | `--color-on-surface-variant` (#5e3f3a) |
| Background (active) | `--color-primary-container` (#d00000) |
| Text (active) | `--color-on-primary` (#ffffff) |
| Border Radius | `--radius-full` (9999px) |
| Padding | `6px 16px` |
| Font | `--text-label-md` (Inter 14px 600) |

### Admin Status Badge (Orders)
| Status | Pip Color | Background | Text |
|---|---|---|---|
| Pending | `--color-status-pending` (#fd8b00) | `--color-status-pending-bg` (#ffdcc3) | `--color-on-secondary-container` (#603100) |
| Ready | `--color-status-ready` (#1a6b2a) | `--color-status-ready-bg` (#c8f0d2) | `#0d3d18` |
| Completed | `--color-status-completed` (#3a3a3a) | `--color-status-completed-bg` (#e5e2e1) | `--color-on-surface` (#1c1b1b) |

### Mobile Bottom Navigation Bar
| Property | Value |
|---|---|
| Background | `--color-blur-surface` with `backdrop-filter: blur(12px)` |
| Border Top | `1px solid --color-outline-variant` (#e8bdb6) |
| Active Icon | `--color-primary-container` (#d00000) |
| Inactive Icon | `--color-on-surface-variant` (#5e3f3a) |
| Label Font | `--text-label-sm` (Inter 12px 500) |
| Items | Home, Menu, Cart (with badge), Account |

---

## Tailwind Theme Extension Reference

Paste into `tailwind.config.js` under `theme.extend`:

```js
colors: {
  primary: {
    DEFAULT:   '#a20000',
    container: '#d00000',
    fixed:     '#ffdad4',
    'fixed-dim': '#ffb4a8',
  },
  secondary: {
    DEFAULT:   '#904d00',
    container: '#fd8b00',
    fixed:     '#ffdcc3',
    'fixed-dim': '#ffb77d',
  },
  tertiary: {
    DEFAULT:   '#705d00',
    container: '#c9a900',
    fixed:     '#ffe16d',
    'fixed-dim': '#e9c400',
  },
  surface: {
    DEFAULT:   '#fcf9f8',
    dim:       '#dcd9d9',
    bright:    '#fcf9f8',
    lowest:    '#ffffff',
    low:       '#f6f3f2',
    container: '#f0edec',
    high:      '#ebe7e7',
    highest:   '#e5e2e1',
  },
  error: {
    DEFAULT:   '#ba1a1a',
    container: '#ffdad6',
  },
  outline: {
    DEFAULT:  '#936e69',
    variant:  '#e8bdb6',
  },
  status: {
    pending:   '#fd8b00',
    ready:     '#1a6b2a',
    completed: '#3a3a3a',
    'sold-out': '#ba1a1a',
  },
},
borderRadius: {
  sm:      '0.25rem',
  DEFAULT: '0.5rem',
  md:      '0.75rem',
  lg:      '1rem',
  xl:      '1.5rem',
  full:    '9999px',
},
fontFamily: {
  display: ['Plus Jakarta Sans', 'sans-serif'],
  body:    ['Inter', 'sans-serif'],
},
fontSize: {
  'display-lg':        ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '800' }],
  'display-lg-mobile': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '800' }],
  'headline-lg':       ['32px', { lineHeight: '40px', fontWeight: '700' }],
  'headline-lg-mobile':['24px', { lineHeight: '32px', fontWeight: '700' }],
  'title-md':          ['20px', { lineHeight: '28px', fontWeight: '600' }],
  'body-lg':           ['18px', { lineHeight: '28px', fontWeight: '400' }],
  'body-md':           ['16px', { lineHeight: '24px', fontWeight: '400' }],
  'label-md':          ['14px', { lineHeight: '20px', fontWeight: '600' }],
  'label-sm':          ['12px', { lineHeight: '16px', fontWeight: '500' }],
},
spacing: {
  xs:   '4px',
  sm:   '8px',
  md:   '16px',
  lg:   '24px',
  xl:   '32px',
  '2xl': '48px',
  '3xl': '64px',
},
boxShadow: {
  card:  '0px 4px 20px rgba(0,0,0,0.05), 0px 0px 0px 1px #eeeeee',
  hover: '0px 8px 32px rgba(0,0,0,0.10), 0px 0px 0px 1px #e0e0e0',
  modal: '0px 24px 64px rgba(0,0,0,0.18)',
},
```
