**MemberCard** — a member's portrait, name, role, one-line bio, and skill chips. The building block of the People grid.

```jsx
<MemberCard
  name="김자람"
  role="41기 회장"
  bio="백엔드와 인프라에 관심이 많습니다."
  tags={["Backend", "Cloud"]}
/>
```

- When `photo` is omitted, the name's first character is shown in the display font over a red tint.
- Hovers lift 3px with a deeper shadow.
