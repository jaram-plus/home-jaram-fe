**Button** — the primary call to action on JARAM surfaces; solid vermilion by default, with lower-emphasis outline/ghost variants.

```jsx
<Button href="/join" size="lg">41기 지원하기</Button>
<Button variant="outline">학회 소개</Button>
<Button variant="secondary" size="sm">자세히 보기</Button>
```

- **Variants:** `primary` (red fill, brand shadow), `secondary` (paper + hairline, reddens on hover), `outline` (red rule, tints on hover), `ghost` (text only).
- **Sizes:** `sm` / `md` / `lg`.
- Renders an `<a>` when `href` is set, else a `<button>`. Hover lifts 1px; press settles. Use `iconRight` for trailing arrows.
