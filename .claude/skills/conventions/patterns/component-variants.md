# Pattern: `cva`-based variant components

Use `class-variance-authority` once a component has more than 2-3 visual
variants (or a variant × size matrix) instead of branching template strings.
Real, current sample — `src/components/ui/Button.tsx`:

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-neutral-900 text-white hover:bg-neutral-700',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-100',
        ghost: 'bg-transparent hover:bg-neutral-100',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
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
- [ ] Interactive primitives (`Button`, `Input`, etc.) forward `ref`.
