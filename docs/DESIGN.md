# Infinity Store visual direction

## Review and plan

The previous cream page and generic infinity illustration did not communicate gaming. Six repeated Game Pass cards made the catalog longer without helping comparison.

Use cinematic gaming photography as the main visual moment, with quiet supporting sections and clear product information. Keep both languages, existing prices, preview status, inquiry links, and publication rules.

Palette: midnight #080D19, slate #131D30, indigo #8D8AFF, cyan #78DCE8, soft white #F4F5FA, blue-grey #A8B3C7.

Typography: Space Grotesk for headings and prices; Manrope for body and controls. Both are served locally through Next.js font optimization.

Layout options considered:

```text
A: [headline] [separate illustration]  -- too close to the existing template
B: [left-aligned headline | photographic scene across one hero] -- selected
   [three concise reassurance points]
   [category filters]
   [Game Pass artwork | duration options + price + inquiry]
   [Windows + Office] [Entertainment]
   [guidance | steps] [FAQ] [contact]
```

Critique before implementation: a gradient behind every card and repeated scroll reveals would feel generic. Reserve the photographic treatment and opening animation for the hero; use gradients only for primary actions and a few intentional surfaces. Consolidate the six Game Pass variants into one interactive duration selector.

## Implemented behavior

- Category buttons filter the preview without page navigation.
- Game Pass duration selection updates the listed price and inquiry URL, including SKU and duration.
- Preview prices and notices remain intact; no ordering or payment was introduced.
- Hero image settles once on arrival; text enters once. User-triggered transitions provide feedback. Reduced-motion preferences disable animation and transitions.
- Mobile layout puts readable copy above the controller image, stacks product sections, and retains the existing expandable menu.

## Artwork

Generated with the built-in ImageGen tool and converted to WebP for delivery (67,722 bytes).

Project asset: `public/assets/atmosphere/gaming-dusk.webp`.

Final prompt:

> Use case: photorealistic-natural. Asset type: widescreen cinematic background photograph for Infinity Store, a restrained premium gaming and digital catalog. Create an editorial still life: a single unbranded matte graphite game controller resting diagonally on a dark finely textured desk, on the RIGHT HALF of the frame. Behind it a softly defocused monitor showing an original atmospheric blue mountain landscape at dusk. Very subtle cyan rim light from the right and soft muted indigo from behind. Deep midnight navy, charcoal, desaturated blue. Real plastic texture and shallow depth of field, sophisticated photographic realism, shot on 50mm lens. Wide 16:9 composition, left 55 percent dark quiet negative space for white website typography, controller and mountain screen concentrated on right, visually restrained. No text, no logos, no watermarks, no UI, no excessive neon, no glowing outlines, no floating objects, no purple smoke. This is atmospheric illustrative gaming imagery, not a product for sale.

## Validation

Production build, TypeScript check, and all nine existing tests passed. Browser review covered desktop and mobile, image loading, category filtering, Game Pass pricing and inquiry parameters, mobile menu navigation, and French/Dutch page switching. A narrow-screen header overflow was found and corrected.
