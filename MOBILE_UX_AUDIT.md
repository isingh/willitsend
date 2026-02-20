# Mobile UX Audit & Redesign — Will It Moon

**Target:** iPhone Safari (including "Request Desktop Site" mode)
**Scope:** Layout, spacing, typography, touch interactions — no product logic changes

---

## 1. Mobile UX Audit Table

### 1.1 Header / Navigation

| Screen | Location | Content Blocks | Mobile Problems (Before) |
|--------|----------|---------------|--------------------------|
| **Sticky Header** | All pages, top | Logo, nav links, Connect Wallet button | Hamburger button only 30px (`p-1.5`) — below 44px Apple HIG minimum. Mobile dropdown nav links `py-2` too short for thumb. No active state indicator. Header height `h-16` wastes vertical space on small phones. Brand text `text-xl` slightly large relative to compact header. |
| **Mobile Dropdown** | Header expand | Vote, My Domains, Leaderboard links | Links `text-sm px-3 py-2` (~32px tap height) — too small. No visual distinction for current page. No tap feedback (`active:` state). |

### 1.2 Home / Vote Page

| Screen | Location | Content Blocks | Mobile Problems (Before) |
|--------|----------|---------------|--------------------------|
| **Page Header** | `/` top | "Vote" heading, description, "My Domains" link | `text-3xl` heading wastes vertical space on mobile. Description text uses default (16px) — fine but `mt-2` gap feels loose. "My Domains" button `py-2.5` acceptable but no `active:` state for tap feedback. |
| **Voting Power Banner** | `/` below header | Power multiplier badge, description | Badge `h-8 w-8` is fine. Text wrapping could push layout. No `min-w-0` / `truncate` on description text — can overflow on narrow screens. `flex justify-between` wrapper around `flex items-center gap-3` creates unused dead space. |
| **Tab Bar** | `/` filter section | All, Recently Listed, Mooning, Dying tabs | 4 tabs in a row with `px-3 py-1.5 text-sm` — "Recently Listed" is long text that makes the bar overflow on iPhone SE (320px). Tabs wrap to second line. No horizontal scroll. Tab height ~28px — below touch minimum. No `active:` tap state. |
| **Search Input** | `/` filter section | Search text input | `py-2` (~36px height) acceptable but below ideal. Full width on mobile works. Focus ring is fine. |
| **Vote Cards (grid)** | `/` main content | Domain name, owner, vote bar, vote buttons | Grid `grid-cols-1 gap-4` OK but `gap-4` (16px) feels dense between full-width cards on mobile. Card padding `p-5` fine. Share link icon has no touch padding — only the 16px icon is tappable. |
| **Vote Buttons** | Inside VoteCard | Moon / Dead buttons | `px-4 py-2.5` (~40px height) — slightly below 44px minimum. No `active:` tap feedback. Only `hover:` states which don't work on touch. `rounded-lg` could be softer. |
| **Connect Wallet Empty State** | `/` when disconnected | Card with heading + description | `py-24` excessive on mobile — pushes content below fold. `p-10` card padding wastes space on small screens. |
| **Loading Skeletons** | `/` while loading | 6 skeleton cards | `h-44` doesn't match actual card height. |
| **Pagination** | `/` bottom | Page info, page size selector, page buttons | Page buttons `min-w-[2rem] px-2 py-1.5` (~28px) — well below touch minimum. Previous/Next arrow buttons same size. Page size `<select>` `py-1` very small. |

### 1.3 My Domains Page

| Screen | Location | Content Blocks | Mobile Problems (Before) |
|--------|----------|---------------|--------------------------|
| **Page Header** | `/domains` top | "My Domains" heading, description | Same oversized heading issue as Vote page. |
| **Domain Card** | `/domains` grid | Name, dates, vote bar, list button | `p-5` padding fine. "List for Voting" button `px-3 py-2 text-xs` (~32px) — too small for thumb. Card corner radius `rounded-xl` could be softer. |
| **Empty State (no wallet)** | `/domains` | Connect wallet prompt | Same excessive `py-24 p-10` padding issue. |
| **Empty State (no domains)** | `/domains` | No domains message | Same issue. |

### 1.4 Leaderboard Page

| Screen | Location | Content Blocks | Mobile Problems (Before) |
|--------|----------|---------------|--------------------------|
| **Leaderboard Table** | `/leaderboard` | Rank, Domain, Moon, Dead, Score columns | **Critical issue:** `<table>` layout with 5 columns at `px-4` each is unreadable on 375px screens. Columns compress, text wraps badly, address display truncates. Table is the wrong pattern for mobile — should be cards. Column headers use `text-xs uppercase` — barely visible. Row padding `py-3` makes rows too short for touch. |

### 1.5 Domain Detail Page

| Screen | Location | Content Blocks | Mobile Problems (Before) |
|--------|----------|---------------|--------------------------|
| **Back Link** | `/domain/[name]` top | "Back to all domains" | Just text + 16px icon — no padding around it, touch target ~20px tall. Easy to mis-tap. |
| **Domain Card** | `/domain/[name]` | Name, owner, share button, vote bar, buttons | Share button `p-2` (~36px) — slightly small. Extra `py-8` wrapper adds unnecessary top padding on mobile (already have `py-8` from layout). |
| **Vote Buttons** | `/domain/[name]` | Moon / Dead | `px-4 py-3` (~44px) — meets minimum. But no `active:` state for tap feedback. |
| **Vote History List** | `/domain/[name]` | Voter address, type, weight, time | Row padding `px-6 py-3` — adequate. Copy button in AddressDisplay is only 14px — too small. |

### 1.6 Shared Components

| Component | Mobile Problems (Before) |
|-----------|--------------------------|
| **AddressDisplay** | Copy button `h-3.5 w-3.5` (14px) — impossibly small touch target. Only `hover:` state, no `active:`. |
| **Pagination** | All interactive elements below 44px minimum. No `active:` states. Select dropdown too small. |

---

## 2. Mobile-Optimized Layouts (ASCII Wireframes)

### 2.1 Header (h-14 on mobile, h-16 on sm+)

```
┌─────────────────────────────────┐
│ [≡]  Will It Moon  beta  [Connect] │  h-14
└─────────────────────────────────┘
   44px                        RainbowKit
   touch                       button
   target

  Expanded mobile menu:
┌─────────────────────────────────┐
│  Vote                      h-12 │
│  My Domains                h-12 │
│  Leaderboard               h-12 │
└─────────────────────────────────┘
  Active page shown in white text
```

### 2.2 Home / Vote Page

```
┌─────────────────────────────────┐
│ Vote                    text-2xl │  ← smaller on mobile
│ Will it moon? Vote...   text-sm  │
│ [  My Domains button   ]  h-11  │  ← full width CTA
├─────────────────────────────────┤
│ ┌──────── Voting Power ───────┐ │
│ │ (2x)  Your votes count as 2 │ │  h-9 badge, truncate desc
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← scrollable tab bar →         │
│ [All] [Recent] [Mooning🚀] [Dying💀]  h-9 per tab
├─────────────────────────────────┤
│ [🔍 Search domains...    ]  h-11│
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ domain.doma          ⇗ 3h  │ │  p-4 card
│ │ Owned by 0x12...ab34  📋   │ │
│ │ ▓▓▓▓▓▓▓▓░░░  moon | dead  │ │  h-2.5 bar
│ │ [  🚀 Moon  ] [ 💀 Dead  ] │ │  h-12 buttons
│ └─────────────────────────────┘ │
│           space-y-3             │  ← stacked, not grid
│ ┌─────────────────────────────┐ │
│ │ another.doma               ...│
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Showing 1-12 of 24  Per page[12]│
│    [<] [1] [2] [>]    h-10 btns │
└─────────────────────────────────┘
```

### 2.3 Leaderboard (Mobile = Cards, Desktop = Table)

```
  Mobile (< 640px):
┌─────────────────────────────────┐
│ Leaderboard             text-2xl│
│ Top domains ranked...   text-sm │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ (1)  domain.doma       +12  │ │  rank badge + score
│ │      by 0x12...34           │ │
│ │ ─────────────────────────── │ │  border-t divider
│ │ 🚀 8    💀 2    10 votes   │ │  stats row
│ └─────────────────────────────┘ │
│         space-y-2               │
│ ┌─────────────────────────────┐ │
│ │ (2)  crypto.doma        +5  │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

  Desktop (≥ 640px):
  Standard table layout preserved
```

### 2.4 Domain Detail Page

```
┌─────────────────────────────────┐
│ ← Back to all domains     h-11  │  ← enlarged touch target
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ domain.doma         [Share] │ │  text-xl, share btn h-11
│ │ Owned by 0x12...34    📋   │ │
│ │ Listed 3h ago               │ │
│ │                             │ │
│ │ 8 moons          2 dead    │ │
│ │ ▓▓▓▓▓▓▓▓▓▓░░░░            │ │  h-3 bar
│ │      80% moon · 10 votes   │ │
│ │                             │ │
│ │ ┌── Voting Power ────────┐ │ │
│ │ │(1x) Hold tokens to... │ │ │  compact banner
│ │ └───────────────────────┘ │ │
│ │                             │ │
│ │ [ 🚀 Moon  ] [ 💀 Dead  ]  │ │  h-12 buttons
│ │     You voted 🚀 moon      │ │
│ └─────────────────────────────┘ │
│           mt-4                  │
│ ┌─────────────────────────────┐ │
│ │ Votes (5)                   │ │
│ ├─────────────────────────────┤ │
│ │ 🚀 0x45...de  2x    3h ago │ │  py-3.5
│ │ 💀 0xab...12         1h ago│ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 2.5 My Domains Page

```
┌─────────────────────────────────┐
│ My Domains              text-2xl│
│ View tokenized domain...text-sm │
├─────────────────────────────────┤
│ Your Domains (12)               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ gradient   │ │  p-4 card
│ │ crypto.doma     Listed 2/1  │ │
│ │ Registered: Jan 1, 2024     │ │
│ │ Expires: Jan 1, 2025        │ │
│ │ ▓▓▓▓░░  3 moon | 1 dead    │ │
│ │ ✓ Listed for voting         │ │
│ └─────────────────────────────┘ │
│         space-y-3               │
│ ┌─────────────────────────────┐ │
│ │ web3.doma                   │ │
│ │ ...                         │ │
│ │ [ List for Voting ]   h-11  │ │  ← enlarged button
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 3. Typography & Spacing Rules

### 3.1 Typography Scale

| Token | Mobile | Desktop (sm+) | Usage |
|-------|--------|---------------|-------|
| **H1 (page title)** | `text-2xl` (24px) | `text-3xl` (30px) | Page headings |
| **H2 (section/card title)** | `text-lg` / `text-base` (16-18px) | `text-xl` (20px) | Card headings, empty state titles |
| **Body** | `text-sm` (14px) | `text-base` (16px) | Descriptions, paragraphs |
| **Meta** | `text-xs` (12px) | `text-xs` (12px) | Timestamps, address labels, vote counts |
| **Button text** | `text-sm` (14px) | `text-sm` (14px) | All interactive buttons |
| **Line height** | Default Tailwind (1.5x) | Default Tailwind (1.5x) | Comfortable reading |

### 3.2 Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px (`space-1`) | Inline gaps within elements |
| `sm` | 8px (`space-2`) | Between related items (e.g., label + value) |
| `md` | 16px (`space-4`, `p-4`) | Card padding (mobile), section gaps |
| `lg` | 24px (`space-6`, `mb-6`) | Between major sections |
| `xl` | 32px (`space-8`, `py-8`) | Page-level padding (desktop only) |
| `2xl` | 40px (`space-10`) | Empty state padding (desktop only) |

### 3.3 Touch Targets

| Element | Minimum Height | Implementation |
|---------|---------------|----------------|
| **Primary buttons** | 48px (`h-12`) on mobile, 44px (`h-11`) on sm+ | Vote buttons, "List for Voting" |
| **Secondary buttons/links** | 44px (`h-11`) on mobile | "My Domains" link, search input |
| **Icon buttons** | 44px (`h-11 w-11`) on mobile, 40px on sm+ | Share, hamburger menu |
| **Pagination buttons** | 40px (`h-10 w-10`) on mobile, 36px on sm+ | Page numbers, prev/next |
| **Nav links (mobile menu)** | 48px (`h-12`) | Mobile dropdown menu items |
| **Tab buttons** | 36px (`h-9`) | Filter tab bar |
| **Copy button (address)** | 28px (`h-7 w-7`) with `-m-1.5` overflow | Inline copy icons |

### 3.4 Safari Wide Viewport Behavior

When Safari sends a wider viewport (e.g., 980-1024px via "Request Desktop Site"):

- `max-width: 428px` applied via `.mobile-shell` on the `<main>` element
- Triggered by `@media (min-width: 640px) and (max-height: 1000px) and (hover: none) and (pointer: coarse)`
- This detects touch devices pretending to be desktop — the interface stays in a centered mobile column
- Text and buttons remain at readable sizes instead of shrinking to fill the faux-desktop width

---

## 4. Component Adjustments

### 4.1 Header (`Header.tsx`)

| Property | Before | After |
|----------|--------|-------|
| Header height (mobile) | `h-16` | `h-14` (compact) / `sm:h-16` |
| Hamburger touch target | `p-1.5` (~30px) | `h-11 w-11` (44px) with `-ml-2` to align |
| Hamburger icon size | `h-5 w-5` | `h-6 w-6` |
| Tap feedback | `hover:text-white` only | `active:bg-zinc-800` added |
| Mobile nav link height | `px-3 py-2` (~32px) | `h-12` (48px) full-width tap row |
| Mobile nav link text | `text-sm` | `text-base` (16px) |
| Active page indicator | None | White text for current route |
| Brand text | `text-xl` always | `text-lg` mobile / `sm:text-xl` |
| Beta badge | `text-xs` always | `text-[10px]` mobile / `sm:text-xs` |

### 4.2 VoteCard (inline in `page.tsx`)

| Property | Before | After |
|----------|--------|-------|
| Card radius | `rounded-xl` | `rounded-2xl` (softer) |
| Card padding | `p-5` | `p-4` mobile / `sm:p-5` |
| Title size | `text-lg` | `text-base` mobile / `sm:text-lg` |
| Title truncation | `truncate` only | + `min-w-0` for flexbox truncation |
| Share icon touch target | No padding (16px icon) | `h-9 w-9` (36px) tap area |
| Time badge | Could wrap | `whitespace-nowrap` added |
| Vote bar height | `h-2` | `h-2.5` (slightly thicker, easier to see) |
| Vote buttons height | `py-2.5` (~40px) | `h-12` (48px) mobile / `sm:h-11` |
| Vote button radius | `rounded-lg` | `rounded-xl` |
| Vote button tap state | `hover:` only | `active:bg-*` + `active:text-*` added |
| Card grid (mobile) | `grid grid-cols-1 gap-4` | `space-y-3` (stacked, tighter gap) |

### 4.3 Leaderboard (`leaderboard/page.tsx`)

| Property | Before | After |
|----------|--------|-------|
| Mobile layout | `<table>` with 5 columns | Card layout (`sm:hidden` cards + `hidden sm:block` table) |
| Card structure | N/A | Rank badge + domain name + score in row, stats below divider |
| Card radius | N/A | `rounded-2xl` |
| Card padding | N/A | `p-4` |
| Rank badge | `h-7 w-7` in table | `h-8 w-8` in card (larger for visual anchor) |
| Domain name | Table cell text | `text-base font-medium` with `truncate` |
| Stats section | Across columns | Horizontal row: `🚀 8  💀 2  10 votes` |

### 4.4 Domain Detail (`domain/[name]/page.tsx`)

| Property | Before | After |
|----------|--------|-------|
| Wrapper padding | `py-8` (+ layout `py-8` = 64px total top!) | `py-2` mobile / `sm:py-8` |
| Back link height | Inline text (~20px) | `h-11` (44px) touch target |
| Back link tap state | `hover:text-white` only | `active:text-white` added |
| Card padding | `p-6` | `p-5` mobile / `sm:p-6` |
| Domain name size | `text-2xl` | `text-xl` mobile / `sm:text-2xl` |
| Share button size | `p-2` (~36px) | `h-11 w-11` (44px) mobile / `sm:h-10 sm:w-10` |
| Share button radius | `rounded-lg` | `rounded-xl` |
| Share button tap | `hover:` only | `active:bg-zinc-700` |
| Vote buttons | `px-4 py-3` | `h-12` mobile / `sm:h-11` + `active:` states |
| Voters list row | `px-6 py-3` | `px-5 py-3.5` mobile / `sm:px-6 sm:py-3` |
| Time in voter row | Could wrap over address | `whitespace-nowrap pl-2` |

### 4.5 DomainCard (`DomainCard.tsx`)

| Property | Before | After |
|----------|--------|-------|
| Card radius | `rounded-xl` | `rounded-2xl` |
| Card padding | `p-5` | `p-4` mobile / `sm:p-5` |
| Title size | `text-lg` | `text-base` mobile / `sm:text-lg` |
| "List for Voting" button | `px-3 py-2 text-xs` (~32px) | `h-11 text-sm rounded-xl` (44px) / `sm:h-10` |
| Button tap state | `hover:` only | `active:bg-indigo-500/20` added |

### 4.6 Pagination (`Pagination.tsx`)

| Property | Before | After |
|----------|--------|-------|
| Page buttons | `min-w-[2rem] px-2 py-1.5` (~28px) | `h-10 min-w-[2.5rem]` (40px) / `sm:h-9` |
| Arrow buttons | `px-2 py-1.5` (~28px) | `h-10 w-10` (40px) / `sm:h-9 sm:w-9` |
| Button tap state | `hover:` only | `active:bg-zinc-800` added |
| Select height | `px-2 py-1` | `h-9` (36px) |
| Button radius | `rounded-md` | `rounded-lg` |

### 4.7 AddressDisplay (`AddressDisplay.tsx`)

| Property | Before | After |
|----------|--------|-------|
| Copy button size | `h-3.5 w-3.5` (14px) | `h-7 w-7` (28px) with `-m-1.5` bleed |
| Copy button tap | `hover:text-zinc-300` only | `active:text-zinc-300` added |

### 4.8 All Empty States

| Property | Before | After |
|----------|--------|-------|
| Vertical padding | `py-24` (96px!) | `py-16` mobile (64px) / `sm:py-24` |
| Card padding | `p-10` (40px) | `p-8` mobile (32px) / `sm:p-10` |
| Heading size | `text-xl` | `text-lg` mobile / `sm:text-xl` |

---

## 5. Safari "Desktop View" Resilience

### Problem
When a user taps "Request Desktop Site" in Safari on iPhone, Safari sends a viewport width of ~980px. Without protection, the app renders at desktop size, making all text and buttons tiny and unusable.

### Solution: `.mobile-shell` Constraint

```css
@media (min-width: 640px) and (max-height: 1000px) and (hover: none) and (pointer: coarse) {
  .mobile-shell {
    max-width: 428px;
    margin-left: auto;
    margin-right: auto;
  }
}
```

**How it works:**
- `min-width: 640px` — only triggers when viewport is wider than our mobile breakpoint
- `max-height: 1000px` — real desktop monitors are taller; phones are short
- `hover: none` — touch devices don't support hover
- `pointer: coarse` — touch input, not mouse

When all conditions match (= an iPhone in "desktop site" mode), the `<main>` container constrains to 428px (iPhone 14 Pro Max width) and centers itself. The UI renders identically to normal mobile view.

### Additional Protections
- `-webkit-text-size-adjust: 100%` on `<body>` prevents Safari from auto-inflating text sizes
- RainbowKit connect button has `@media (max-width: 374px)` override to shrink on iPhone SE
- All font sizes use responsive variants (`text-2xl sm:text-3xl`) so they never depend on viewport width alone
- No hover-dependent interactions — everything uses `active:` states for tap feedback

---

## 6. Implementation Guidance

### 6.1 Global Rules (Applied)

1. **Base font size:** System default 16px (browser default, not overridden)
2. **Text inflation guard:** `-webkit-text-size-adjust: 100%` on `<body>`
3. **Touch targets:** Every interactive element is at least 36px, ideally 44px+ on mobile
4. **Tap feedback:** `active:` pseudo-class on all buttons/links (not just `hover:`)
5. **Card radius:** Consistently `rounded-2xl` (16px) for primary cards, `rounded-xl` (12px) for nested elements
6. **Mobile card stacking:** `space-y-3` on mobile, grid on `sm:` and up
7. **Page padding:** `py-5` mobile (20px) / `sm:py-8` (32px) — reduces wasted whitespace
8. **Responsive headings:** `text-2xl sm:text-3xl` pattern for all page titles
9. **Responsive descriptions:** `text-sm sm:text-base` pattern
10. **No hover-only interactions:** Every `hover:` has a matching `active:` variant

### 6.2 CSS Custom Properties (in `globals.css`)

```css
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 2.5rem;   /* 40px */
  --touch-min: 2.75rem;  /* 44px */
}
```

### 6.3 Scrollable Tab Bar (CSS class)

```css
.tabs-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.tabs-scroll::-webkit-scrollbar {
  display: none;
}
```

Used with `-mx-4 px-4` on the container to allow edge-to-edge scrolling while maintaining page gutters.

### 6.4 Key Tailwind Patterns

**Responsive button height:**
```tsx
className="h-12 sm:h-11 ..."  // 48px mobile, 44px desktop
```

**Responsive padding:**
```tsx
className="p-4 sm:p-5 ..."     // 16px mobile, 20px desktop
```

**Touch feedback:**
```tsx
className="active:bg-zinc-800 hover:bg-zinc-800 ..."
```

**Mobile stacked → Desktop grid:**
```tsx
className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3"
```

**Text truncation in flex containers:**
```tsx
className="min-w-0 truncate ..."  // min-w-0 is required for flex children
```

### 6.5 Files Changed

| File | Changes |
|------|---------|
| `src/app/globals.css` | Spacing tokens, Safari resilience media query, tab scroll class, RainbowKit override |
| `src/app/layout.tsx` | `mobile-shell` class, responsive padding `py-5 sm:py-8` |
| `src/components/Header.tsx` | 44px hamburger, 48px nav links, active page state, compact mobile header |
| `src/app/page.tsx` | Scrollable tabs, 48px vote buttons, stacked card layout, responsive typography |
| `src/app/leaderboard/page.tsx` | Card layout for mobile, table preserved for desktop |
| `src/app/domain/[name]/page.tsx` | 44px back link, 44px share button, reduced top padding, active states |
| `src/app/domains/page.tsx` | Responsive heading sizes |
| `src/components/DomainCard.tsx` | 44px list button, responsive padding, rounded-2xl |
| `src/components/DomainGrid.tsx` | Stacked cards on mobile, responsive empty states |
| `src/components/Pagination.tsx` | 40px page buttons, 40px arrows, larger select |
| `src/components/AddressDisplay.tsx` | 28px copy button with negative margin bleed |
