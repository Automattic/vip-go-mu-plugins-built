# `intro_desktop.html` — Default Intro (Desktop) Screen

Desktop variant of the invitation flow's intro screen. Used by the public invitation route (default `/invitation/<slug>`, configurable via `Clipisode_Invitation::get_prefix()`) when a guest opens an invitation link in a desktop browser.

For shared theme conventions (lock model, placeholder tokens, slot injection, reseed workflow, default logo handling) see [`README.md`](README.md). This file covers what's specific to the desktop intro.

## Layout

Two-column white card centered on a light gray viewport:

- **Left column** — portrait video (the topic's intro video).
- **Right column** — vertical stack: logo → topic title → instructions → live invitation URL → QR helper text → QR code.

### Equal-width columns

Both columns are sized off the card's height, not its width:

- Card: `height: min(90vh, 800px)`. The card grows with the viewport up to an 800px cap on huge displays.
- Left column: `height: 100%; aspect-ratio: 9/16; width: auto`. Width is therefore `cardInnerHeight × 9/16` — the natural portrait video size.
- Right column: same trio (`height: 100%; aspect-ratio: 9/16; width: auto`). It ends up the **exact same width** as the left column, so the card is visually balanced regardless of viewport.

Card width is `auto` — the card sizes itself to fit (left + right + gap + padding). It centers in the canvas via `margin: 0 auto` on the card and `align-items: center` on the root group.

### Known caveat: narrow viewports don't scroll

Below the breakpoint where left/right stack vertically, the card's `height: min(90vh, 800px)` clips content that no longer fits and the page doesn't scroll. Tracked as a follow-up — fix is either drop the height cap below the breakpoint, switch to `min-height` + `height: auto`, or route narrow viewports to the mobile `intro` screen instead.

## Lock model — desktop specifics

The shared lock-model categories (author-controlled / structural / PHP-injected) are described in the README. This screen's specific assignments:

| Block | Category | Authors can |
|---|---|---|
| Logo (`core/image`) | Author-controlled, no lock | Replace with any Media Library image, resize, link, move, delete. Default is the imported `icon.png`. |
| Topic title (`core/heading`) | Author-controlled, `lock: {move, remove}` | Edit text, change heading level (H1→H2→H3…), pick from the S/M/L/XL/XXL size scale, change color, etc. |
| Instructions paragraph | Author-controlled, `lock: {move, remove}` | Edit text and styling. |
| QR helper paragraph | Author-controlled, `lock: {move, remove}` | Edit text and styling. |
| QR placeholder (`core/image`) | Author-controlled, `lock: {remove}` only | Resize, pad, border, change alignment, **and reorder** (move above the logo, etc.). Lock prevents removal so the public renderer always finds a `clipisode-introd-qr-image` figure to swap for the live QR mount at request time. |
| Root group | Structural, `lock: {move, remove}` | Reorder/replace children, change padding/background. |
| Card group | Structural, `lock: {move, remove}` | Same. Could even add a third column. |
| Right column group | Structural, `lock: {move, remove}` | Reorder children, add new blocks inside the right column. |
| Left column group | Structural, `lock: {move, remove}` | Drop their own blocks in. The renderer **appends** the topic intro video below them. |
| URL slot (`core/group`) | PHP-injected, `templateLock: "all"` | Adjust padding/margin/background only. |

## Logo sizing

The image block sets `width: 64px` inline on the `<img>` and leaves height to `auto`. This matches what WordPress's `core/image` save function produces for an editor-resized image, which is required for the block to pass Gutenberg's strict validator. Setting `height` instead and leaving `width: auto` would render replacement logos with consistent height regardless of aspect ratio — but the block markup wouldn't match what `save()` produces, and the block would fail validation with a "recover this content" prompt every time the screen post is opened.

This means **wide logos render wider than the original** and **tall logos render taller**. The default logo is square (500×500) so it renders 64×64. A 200×400 portrait logo would render 64×128. Validation passing matters more than locked-aspect sizing — and authors who want a specific size can resize via the block toolbar.

## QR placeholder vs. live QR

The starter HTML embeds a real `core/image` block with class `clipisode-introd-qr-image` pointing at the imported `sample-qr.png` placeholder. Authors edit the figure like any other image — resize handle, padding, border, alignment, reorder.

At render time the public flow regex-matches the figure by class and replaces the entire `<figure>...</figure>` (image + wrapper) with a `<div class="clipisode-introd-qr">` that the bundled QR encoder hydrates into a `<canvas>` showing the current invitation URL. Author-set figure styling (resize / alignment / border) does NOT survive that swap — the live QR mount has its own size and box rules in `theme.css` because the encoder owns the canvas dimensions. If we ever want author width / alignment to flow through, the renderer would need to lift those attributes off the figure and re-apply them to the mount div.

The `lock: {remove}` on the image is intentional. Authors who delete the figure remove the only target the renderer has to inject the live QR; the desktop intro screen would then ship to guests without a QR. Allowing **move** (drag above the logo, into a different position in the right column) is fine — the renderer matches by class, not position.

## Related files

- [`README.md`](README.md) — shared theme conventions.
- `plugin/clipisode/assets/templates/clipisode-flow.php` — public renderer. Look for `if ( $st === 'intro_desktop' )`.
- `plugin/clipisode/includes/class-post-types.php` — seeder, editor canvas CSS for `screen_type === 'intro_desktop'`.
