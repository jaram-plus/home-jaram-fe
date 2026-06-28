# JARAM Design System

A design system for **JARAM (자람)** — the 41-year-old computer science club (컴퓨터학회) of Hanyang University's ERICA campus, founded 1984. JARAM's identity rests on heritage and a virtuous cycle of learning: *받은 만큼 나누고, 나눈 만큼 성장하는 선순환 컴퓨터 학회* ("share as much as you receive, grow as much as you share").

This system expresses that heritage through a deliberate visual language: **warm paper grounds, a single vermilion point color, and type-forward layouts** anchored by the MapoGeumbitnaru display face. It is a refined, editorial direction — prestige and tradition (명문·전통) made tangible through typography and fine detail rather than ornament.

> **Note — this is a redesign direction.** The live JARAM site (`home-client-web-2025`) currently uses a dark tech-gradient aesthetic with the Geist typeface. This system intentionally reframes the brand toward warm paper + serif/display heritage per the brand brief. The vermilion `#E50113` is carried forward unchanged; everything else is new.

## Sources
- **GitHub — `jaram-plus/home-jaram-fe`** (https://github.com/jaram-plus/home-jaram-fe) — current Next.js scaffold (the new homepage repo).
- **GitHub — `jaram-plus/home-client-web-2025`** (https://github.com/jaram-plus/home-client-web-2025) — the previous full homepage; source of all real content, brand red (`#e50113`), copy, member/activity structure, and alumni employer logos used in the UI kit.
- **Logo** — `assets/logos/jaram-mark.png` (the JR monogram, supplied by the client).
- The broader org is at https://github.com/jaram-plus — explore it for deeper context on JARAM's products (homepage, anonymous board, member services).

Anyone extending this system should read those repos for fuller product context.

---

## CONTENT FUNDAMENTALS

**Language.** Primary language is **Korean**; English appears only as small uppercase eyebrows/labels (e.g. `WHAT WE DO`, `PEOPLE`, `ALUMNI`, `Since 1984`). Korean is the voice; English is decoration and wayfinding.

**Tone & person.** Warm, composed, and quietly proud. JARAM addresses the reader in **존댓말** (polite form) — *"…되어보세요", "…만나보세요", "함께하세요"* — invitational, never barking. It speaks as "we" (우리) about itself and to "you" (여러분) the prospective member. Confidence comes from **depth, not hype**: it leans on real numbers (41년, 1984, 500+) rather than superlatives.

**Casing.** Korean runs sentence-case naturally. Latin eyebrows are ALL-CAPS with wide tracking (`--ls-label`). Headlines mix a black/plain segment with a **red highlight phrase** — e.g. 함께 성장하는 **3가지 방법**, 자람의 **인재들**.

**Rhythm.** Short, balanced lines, often hand-broken with `<br>` for typographic poise (the tagline is three stacked lines). Body copy is generous and readable; captions are sparse.

**Numbers as voice.** Heritage figures are a content device, set large in the editorial serif (see `Stat`). 41 / 70+ / 500+ / 1984 recur as proof of legacy.

**Emoji.** Avoid. The previous site used 🚀👥💼 in one CTA block — **this direction drops them**; the refined heritage tone is incompatible with emoji. Use the red rule, the seal, or a serif numeral for emphasis instead.

**Example copy (verbatim from the product):**
- Tagline: *받은 만큼 나누고, 나눈 만큼 성장하는 선순환 컴퓨터 학회*
- Sub: *한양대학교 ERICA캠퍼스의 역사깊은 컴퓨터학회 JARAM에서 함께 성장하는 개발자가 되어보세요*
- Identity line: *41년의 깊이, 함께 성장하는 사람들의 커뮤니티*
- Core values: 성장 · 협력 · 혁신
- CTAs: 지원하기 · 41기 지원하기 · 학회 소개 · 선배들 만나보기

---

## VISUAL FOUNDATIONS

**Color.** A warm, two-pole palette. The **ground** is warm paper — a family of aged off-whites from `--paper-50` (#FFFDF8) to `--paper-400` (#E7DCC6); the page default is `--paper-200` (#F7F1E5). The **point color** is the JARAM vermilion `--red-400` **#E50113** (the logo red, carried verbatim), with `--red-500` #C0392B for hover and a deep oxblood `--red-700` #7E0610 ("seal red") for serif numerals, rules, and stamps. Text is **warm ink**, never pure black: `--ink-900` #1C1813 for headings down through `--ink-500` for captions. There is **one** accent hue — red does all the emphatic work; everything else is paper and ink. An inverted "ink" section (`--surface-ink`) provides contrast for the alumni band.

**Type.** Three families, each with a job. **MapoGeumbitnaru** (`--font-display`) — a brushed, calligraphic Korean display face — carries hero headlines and large brand moments; it is the soul of the redesign. **Gowun Batang** (`--font-serif`), a Myeongjo serif, sets numerals, pull-quotes, and editorial section titles — the source of the 명문·전통 feel. **Pretendard** (`--font-sans`) handles all body, labels, navigation, and UI. IBM Plex Mono covers code/data. The scale is large and confident (display clamps to ~104px); Korean body uses generous leading (`--lh-normal` 1.6).

**Backgrounds.** Flat warm paper — **no gradients** on content surfaces (the previous site's purple/grey/red gradients are explicitly retired). The only "imagery" device is a very faint (5% opacity) oversized JR mark used as a watermark/seal behind the hero. Full-bleed color is reserved for the single inverted ink section. No textures or repeating patterns.

**Spacing & layout.** 8px base rhythm (`--space-*`), `--container-max` 1200px, fluid section padding (`--section-y`). Layouts are calm and generous, organized by hairline rules and whitespace. The header is a fixed/sticky translucent paper bar with a blur and a bottom hairline.

**Borders & rules.** Warm hairlines (`--line` #E4DAC6 family) — never cold grey. The **1px red rule** and the 3px red top-accent on cards are signature devices. Borders are 1–1.5px; the brand outline is 1.5px.

**Corners.** Modest. `--radius-md` (8px) is the default; cards use `--radius-lg` (14px); pills for tags/chips. Heritage comes from type and rules, **not** heavy rounding.

**Shadows.** Warm and low — tinted with brown (`rgba(60,44,24,…)`), never grey. `--shadow-sm` for resting cards, `--shadow-lg` on hover/modals, `--shadow-brand` (red-tinted) on primary buttons only.

**Cards.** Paper surface (`--surface-card` #FCF8F0), 1px warm border, `--radius-lg`, `--shadow-sm`. Optional 3px red top accent (`accent="top"`). Interactive cards lift 4px with a deeper shadow.

**Motion.** Restrained and confident. Standard ease is `--ease-out` (cubic-bezier .2,.7,.2,1) over `--dur` 240ms. Buttons lift 1px on hover and settle ~1.5% on press; cards lift on hover. No bouncing, no infinite decorative loops. (The previous site's typing/particle hero animation is dropped in favor of static typographic impact.) Honor `prefers-reduced-motion`.

**Hover / press.** Hover = a small lift plus a tonal shift (primary → `--brand-hover`; outline → `--brand-tint` fill; secondary → red border+text). Press = settle/scale-down slightly. Links shift to red on hover.

**Transparency & blur.** Used sparingly: the sticky header (paper at ~86% with a 10px blur) and the modal scrim (ink at 55% with a 3px blur). Content surfaces are opaque.

---

## ICONOGRAPHY

JARAM's product has **no icon font and no bespoke icon set**. Two patterns appear in the source:

1. **UI icons** — inline **Heroicons-style outline SVGs**: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, round caps/joins (lightbulb, book, users, arrow-right, check-circle, etc.). They inherit color via `currentColor` and are sized 16–40px.
2. **Brand/social icons** — solid-fill SVG glyphs for Instagram, GitHub, and YouTube, sized ~24px, tinted to `--text-faint` and reddening on hover.

**Recommendation for new work:** use **[Heroicons](https://heroicons.com/)** (outline, 24px, stroke-2) for UI — it matches the existing stroke weight exactly — or **[Lucide](https://lucide.dev/)** via CDN for a slightly finer line. Keep all UI icons monochrome `currentColor`. For social/brand marks, use each platform's official glyph. **Do not** hand-roll decorative SVGs or use emoji as icons. Unicode is acceptable only for tiny inline marks (the `→` arrow, the `·` bullet, the `×` close); the design favors a serif numeral or the red rule over an icon wherever an icon would merely decorate.

The **JR monogram** (`assets/logos/jaram-mark.png`) is the one true brand glyph — usable on paper, on ink, knocked out white on red, or as a faint oversized seal/watermark. See the Brand foundation cards.

---

## INDEX

**Root**
- `styles.css` — global entry point (imports only). Consumers link this one file.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `assets/` — `logos/` (JR mark + wordmark), `companies/` (alumni employer logos), `images/` (og-image).
- `guidelines/` — foundation specimen cards (Type, Colors, Spacing, Brand).
- `SKILL.md` — Agent-Skill manifest for downloadable use.

**Components** (`components/`, namespace `window.JARAMDesignSystem_902d5f`)
- `core/` — **Button**, **Card**, **SectionHeader**, **Stat**, **Tag**
- `forms/` — **Input**
- `people/` — **MemberCard**

Each has a `.jsx`, a `.d.ts` props contract, a `.prompt.md` usage note, and a `@dsCard` thumbnail.

**UI Kits** (`ui_kits/`)
- `jaram-home/` — interactive recreation of the JARAM homepage (hero, activities, people, alumni, CTA + working Join modal). `index.html` + `screens.jsx` + `README.md`.

The **Design System tab** shows every foundation, component, and kit card.
