**Input** — labelled text field on warm paper, with hint and error states.

```jsx
<Input label="이름" placeholder="홍길동" />
<Input label="자기소개" as="textarea" hint="간단히 작성해 주세요" />
<Input label="이메일" error="올바른 이메일을 입력하세요" />
```

- `as="textarea"` for multiline. `error` overrides `hint` and turns the border + message red.
- Focus draws a brand ring (`--brand-tint`).
