---
name: jaram-design
description: Use this skill to generate well-branded interfaces and assets for JARAM (자람) — the Hanyang University ERICA computer science club — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping in JARAM's heritage direction (warm paper, vermilion, MapoGeumbitnaru display type).
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

## Where the code lives in THIS repo
The brand rules are in this skill folder; the actual code to import is under **`src/design-system/`**:
- `src/design-system/styles.css` — import once in the app entry; pulls in all tokens + CDN fonts.
- `src/design-system/tokens/` — colors, typography, spacing, effects, fonts (CSS variables).
- `src/design-system/components/` — React primitives. Import via `import { Button, Card, … } from '@/design-system'`. Each has a `.prompt.md` usage note beside it.
- `src/design-system/assets/` — JR logo mark/wordmark, alumni employer logos, og-image.

When building UI, **only** use these tokens/components. The `ui_kits/jaram-home/` and `guidelines/` referenced below live in the original design-system project (for layout cribbing) and are not bundled into this repo.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `readme.md` — full brand guide: context, content fundamentals, visual foundations, iconography, file index.
- `styles.css` — link this one file to pick up all tokens and webfonts.
- `tokens/` — colors, typography, spacing, effects, fonts as CSS custom properties.
- `assets/` — JR logo mark, alumni employer logos, og-image.
- `components/` — React primitives (Button, Card, Tag, Stat, SectionHeader, Input, MemberCard).
- `ui_kits/jaram-home/` — full interactive homepage recreation to crib layouts from.
- `guidelines/` — foundation specimen cards.

## Essentials
- **Point color:** vermilion `#E50113`. **Ground:** warm paper `#F7F1E5`. **Ink:** warm near-black `#1C1813` (never pure black).
- **Type:** MapoGeumbitnaru (display/hero), Gowun Batang (serif numerals & editorial), Pretendard (body/UI).
- **Voice:** Korean, polite (존댓말), warm and proud; depth over hype. No emoji. Latin only as small uppercase eyebrows.
- **Feel:** refined, editorial, heritage (명문·전통). Flat paper, hairline rules, red highlights, modest corners, warm low shadows. No gradients.
