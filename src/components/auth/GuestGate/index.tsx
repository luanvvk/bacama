import Link from 'next/link';
import { Lock, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';

export interface GuestGateAction {
  label: string;
  href: string;
}

export interface GuestGateProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: GuestGateAction;
  secondaryAction?: GuestGateAction;
  hint?: string;
  icon?: LucideIcon;
}

export const GuestGate = ({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  hint,
  icon: Icon = Lock,
}: GuestGateProps) => (
  <div className="mx-auto max-w-xl py-16 text-center">
    <div className="bg-primary/10 text-primary mx-auto flex size-20 items-center justify-center rounded-full">
      <Icon className="size-8" aria-hidden="true" />
    </div>
    <p className="text-muted-foreground mt-5 font-mono text-xs tracking-widest uppercase">
      {eyebrow}
    </p>
    <Heading as="h1" size="lg" className="mt-3">
      {title}
    </Heading>
    <Text variant="muted" className="mx-auto mt-4 max-w-prose">
      {description}
    </Text>
    <div className="mt-7 flex flex-wrap justify-center gap-3">
      <Button asChild size="lg">
        <Link href={primaryAction.href}>{primaryAction.label}</Link>
      </Button>
      {secondaryAction && (
        <Button asChild variant="outline" size="lg">
          <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
        </Button>
      )}
    </div>
    {hint && <p className="text-muted-foreground mt-6 text-sm">{hint}</p>}
  </div>
);
