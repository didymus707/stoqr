# stoQr design system: decisions for building in React Native

Design reference: https://claude.ai/artifact/HvdFDKY7NE2bbjNWvhXvmu
Screens: https://claude.ai/artifact/DyBoBdMDBs9oZXYJYiBWoA

## Colour tokens: pick by job, not by value

Several tokens share a hex value today. Use the one that names the job,
so a future change (or dark mode) doesn't break anything.

| Job | Token | Not |
|---|---|---|
| Screen background | `surface` | `surfaceRaised` |
| Cards, inputs, footer, tab bar | `surfaceRaised` | `surface` |
| Card and input borders | `line` | `lineSoft` |
| Dividers between rows in a card | `lineSoft` | `line` |
| Main text and icons | `ink` | `inverse` |
| Secondary text (meta, hints) | `inkMuted` | — |
| Inactive tabs, placeholders, quiet icons | `inkSubtle` | `inkMuted` |
| Main action fill (one per screen) | `accent` + `onAccent` | — |
| Small orange text: required `*`, "Price needed", "Low" | `accentText` | `accent` |
| Black blocks: secondary button, stat card, selected chip, "Out" pill | `inverse` + `onInverse` | `ink` + white |
| "Stocked", new totals after restock | `ok` on `okSoft` | — |
| Low-stock pill fill, tip cards | `accentSoft` | — |

Never write a hex code outside `constants/theme.ts`. `"transparent"` is the only exception.

## Type

- All text uses `components/ui/Text` with a `variant`
  (`titleSm`, `heading`, `item`, `body`, `label`, `overline`, `caption`, `price`, …).
- No `fontWeight`, ever. Each font file is a single weight, and `fontWeight` can make
  Android fall back to the system font. Change weight by changing variant.
- `overline` is written in lowercase in code; the variant uppercases it ("4 items").
- Prices, quantities in fields and codes use the mono face (`price`, `code`).
- To colour part of a line, nest a `Text`:
  `<Text variant="label">Store <Text variant="label" color={c.accentText}>*</Text></Text>`

## Components

- **A new look is a new `variant`. `style` is for placement only**
  (margin, `alignSelf`, `flex`, width). Never pass colours, heights, padding or
  radius through `style`; if you need them, add a variant.
- Button variants: `primary` (accent, one per screen), `secondary` (inverse).
  Use `value` for a figure on the right: `value="£7.60"`.
- IconButton variants: `raised` (bordered circle, e.g. back), `inverse`,
  `ghost` (no border, `inkSubtle` icon, e.g. the remove ✕).
- TextField: `icon` for the store field, `prefix="£"` + `mono` for prices,
  `size="sm"` inside rows, `invalid` for missing required values.
- Icons only from `components/ui/Icon`. No emoji anywhere in the UI.

## Layout

- Screen side gutter 20 (`Spacing.s20`), 52 from the top on tab screens.
- A list is ONE card (`surfaceRaised`, `line` border, `Radius.card`,
  `overflow: "hidden"`), with a `lineSoft` divider on the top of every row except the first.
- The main action sits in a white footer pinned below the scroll view,
  with a `line` top border. If it's disabled, a line above it says why.
- Radii: `control` 12 (steppers, small fields), `field` 14 (fields),
  `button` 16, `card` 20, `hero` 24, `pill` for chips and round buttons.

## Copy

- Sentence case everywhere, including buttons: "Confirm restock", not "Confirm Restock".
- Words people use at home: cupboard (not inventory), shopping list, running low, out,
  restock, price paid.
- Item names the way a receipt writes them: "Semi-skimmed milk, 4 pints".
- UK money and units: "£1.45", "4 pints", real shop names.
- Buttons say what happens, with the number: "Add 4 items to cupboard".
- A real ellipsis while busy: "Confirming…".
- Prices from other shoppers are always attributed ("from 38 local price reports").

## Open decisions

- **Error colour.** Invalid fields currently use `accent`, the same orange as the
  main button. Proposed: a separate `danger` token for invalid states, always paired
  with words ("Price needed"). Undecided.
- **Dark mode.** The tokens are designed for it (see the design system), but the app
  only uses `Colors.light` so far.
