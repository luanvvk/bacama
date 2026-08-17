---
name: design-system
description: Token architecture and component specifications. Three-layer tokens (primitive→semantic→component), CSS variables, spacing/typography scales, component specs. Curated from nextlevelbuilder/ui-ux-pro-max-skill (markdown reference docs only — the slide-generation system and its Python/CSV backend were not vendored).
argument-hint: '[component or token]'
license: MIT
metadata:
  author: claudekit
  version: '1.0.0'
---

# Design System

Token architecture, component specifications, systematic design. Distilled from [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (MIT) — reference markdown only, no scripts.

## When to Use

- Design token creation
- Component state definitions
- CSS variable systems
- Spacing/typography scales
- Design-to-code handoff
- Tailwind theme configuration

## Token Architecture

Load: `references/token-architecture.md`

### Three-Layer Structure

```
Primitive (raw values)
       ↓
Semantic (purpose aliases)
       ↓
Component (component-specific)
```

**Example:**

```css
/* Primitive */
--color-blue-600: #2563eb;

/* Semantic */
--color-primary: var(--color-blue-600);

/* Component */
--button-bg: var(--color-primary);
```

## References

| Topic                | File                                 |
| -------------------- | ------------------------------------ |
| Token Architecture   | `references/token-architecture.md`   |
| Primitive Tokens     | `references/primitive-tokens.md`     |
| Semantic Tokens      | `references/semantic-tokens.md`      |
| Component Tokens     | `references/component-tokens.md`     |
| Component Specs      | `references/component-specs.md`      |
| States & Variants    | `references/states-and-variants.md`  |
| Tailwind Integration | `references/tailwind-integration.md` |

## Component Spec Pattern

| Property   | Default | Hover        | Active         | Disabled     |
| ---------- | ------- | ------------ | -------------- | ------------ |
| Background | primary | primary-dark | primary-darker | muted        |
| Text       | white   | white        | white          | muted-fg     |
| Border     | none    | none         | none           | muted-border |
| Shadow     | sm      | md           | none           | none         |

## Applying This to Bacama

Bacama already has a three-layer token system in `src/app/globals.css` (`:root` / `.dark`) using the "paper & ink" naming (`--primary`, `--success`, `--ink-faint`, etc.) — this skill's reference docs are for reasoning about _extending or auditing_ that existing system, not generating a new one from scratch. Cross-check any new token against `globals.css` before introducing one.

## Best Practices

1. Never use raw hex in components — always reference tokens
2. Semantic layer enables theme switching (light/dark)
3. Component tokens enable per-component customization
4. Use HSL format for opacity control
5. Document every token's purpose
