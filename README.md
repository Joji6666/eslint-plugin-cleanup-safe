# eslint-plugin-cleanup-safe

Custom ESLint rule to enforce explicit return types, except in `useEffect` cleanup functions and `styled-components` expressions.

> ✅ **Tested and confirmed to work in version `1.1.0`**

---

## 📦 Installation

```bash
npm install --save-dev eslint-plugin-cleanup-safe
```

or

```bash
yarn add --dev eslint-plugin-cleanup-safe
```

---

## 🔧 Configuration

This plugin extends the functionality of  
**`@typescript-eslint/explicit-function-return-type`**  
to **ignore common patterns like `useEffect` cleanups and styled-components**, which usually don't require explicit return types.

If you're currently using `@typescript-eslint/explicit-function-return-type`,  
**you should turn it off** and use this rule instead.

### Example (`.eslintrc.js` or `.eslintrc.json`)

```js
module.exports = {
  plugins: ["cleanup-safe"],
  rules: {
    // ❌ Turn off base rule
    "@typescript-eslint/explicit-function-return-type": "off",

    // ✅ Enable the custom rule
    "cleanup-safe/explicit-function-return-type-except-cleanups": [
      "error",
      {
        allowTypedFunctionExpressions: true
      }
    ]
  }
};
```

---

## 💡 What This Rule Adds

This custom rule enforces **explicit return types** on all functions,  
**except in the following cases**:

- ✅ `useEffect` cleanup functions
- ✅ Functions inside `styled-components` template literals
- ✅ Arrow functions in contexts with **return type inference** (e.g. `.map`, `.filter`, `.then`) when `allowTypedFunctionExpressions: true`

---

## ⚙️ Options

| Option                                      | Type    | Default | Description                                                        |
| ------------------------------------------- | ------- | ------- | ------------------------------------------------------------------ |
| `allowTypedFunctionExpressions`             | boolean | false   | Allow omission of return type in contexts where it can be inferred |
| `allowExpressions`                          | boolean | false   | _(Reserved for future use)_                                        |
| `allowHigherOrderFunctions`                 | boolean | false   | _(Reserved for future use)_                                        |
| `allowDirectConstAssertionInArrowFunctions` | boolean | false   | _(Reserved for future use)_                                        |

---

## ✅ Valid Examples

```ts
useEffect(() => {
  return () => {
    console.log("cleanup");
  };
});

const Button = styled.button`
  ${(props) => {
    return props.disabled ? "opacity: 0.5;" : "";
  }}
`;

const ids = items.map((item) => item.id); // allowed when allowTypedFunctionExpressions = true
```

---

## ❌ Invalid Examples

```ts
function doSomething() {
  return "oops"; // ❌ Missing explicit return type
}

const getData = () => {
  return fetch("/api"); // ❌ Missing explicit return type
};
```

---

## ✅ Version Info

- Compatible with ESLint `>=8`
- Tested on `eslint-plugin-cleanup-safe@1.1.0`

---
