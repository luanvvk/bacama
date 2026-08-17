# Pattern: `cva`-based variant components

Use `class-variance-authority` once a component has more than 2-3 visual
variants (or a variant × size matrix) instead of branching template strings.
Real, current sample — `src/components/ui/Button/index.tsx`:

```tsx
const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent font-mono text-xs font-semibold tracking-widest uppercase transition-all outline-none focus-visible:border-ring focus-visible:ring-0 disabled:opacity-45',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-foreground',
        outline:
          'border-input bg-transparent text-foreground hover:border-primary hover:text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: 'hover:bg-muted hover:text-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary normal-case underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 gap-1.5 px-2.5',
        sm: 'h-7 gap-1 rounded-md px-2.5 text-sm',
        lg: 'h-9 gap-1.5 px-2.5',
        icon: 'size-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

const Button = ({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

export { Button, buttonVariants };
```

## Checklist

- [ ] Base classes shared by every variant go in the first `cva()` argument.
- [ ] Each variant axis (`variant`, `size`, ...) is its own key under `variants`.
- [ ] `defaultVariants` set so the component works with zero props passed.
- [ ] The component still accepts `className` and merges it **last** through
      `cn(buttonVariants({ ... }), className)` so a caller can override.
- [ ] `VariantProps<typeof xVariants>` is spread into the component's public
      props interface — don't hand-write a parallel `variant: 'primary' | ...`
      union that can drift from the `cva()` definition.
- [ ] Every class comes from Tailwind's native scale (`rounded-lg`, `text-xs`)
      or a `--color-*` theme token (`bg-primary`) — no arbitrary-value classes
      and no hardcoded hex/px, per the root conventions doc.
- [ ] Interactive primitives (`Button`, `Input`, etc.) accept a `ref` — React
      19 passes `ref` through as a plain prop on host-element types, so
      `forwardRef` usually isn't needed here; only reach for it (with a
      `displayName`) when the component genuinely needs to intercept the ref.

## Adding a new shadcn/ui primitive

This project uses [shadcn/ui](https://ui.shadcn.com) (Radix-based, `style:
"radix-nova"`, configured in `components.json`) for interactive primitives.
To add one:

1. `pnpm dlx shadcn@latest add <name>` — generates `src/components/ui/<name>.tsx`.
2. Move it into the folder-per-component shape: `mkdir src/components/ui/<PascalName>` then move the file to `<PascalName>/index.tsx`.
3. Convert every `function X(...) { ... }` in the file to `const X = (...) => { ... }` (collapse to implicit-return where the body is a single `return`), matching this repo's arrow-function convention — shadcn's own generator always emits `function` declarations.
4. Fix any imports the generated file has to sibling primitives (e.g. `@/components/ui/button` → `@/components/ui/Button`).
5. Re-theme it: it should need **no hardcoded colors** — shadcn components are already written against the same CSS variables (`bg-primary`, `bg-popover`, etc.) this project's `globals.css` defines, so it inherits the brand palette automatically. Swap `shadow-md`/`shadow-lg` for `shadow-brand`/`shadow-brand-lg` and `ring-3`/`ring-ring/50` focus styles for `ring-0` + `focus-visible:border-ring` to match this project's border-only focus convention.
6. Add `export * from './<PascalName>';` to `src/components/ui/index.ts`.
