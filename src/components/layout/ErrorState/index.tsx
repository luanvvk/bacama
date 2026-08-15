'use client';

import Link from 'next/link';

import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';

export const ErrorState = ({
  title,
  description,
  actionLabel = 'Back to home',
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <main className="flex flex-1 items-center py-20">
    <Container>
      <div className="mx-auto max-w-xl text-center">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          Bacama · a small detour
        </p>
        <Heading as="h1" size="xl" className="mt-4 text-5xl">
          {title}
        </Heading>
        <Text variant="lead" className="text-muted-foreground mt-5">
          {description}
        </Text>
        {onAction ? (
          <Button type="button" className="mt-8" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : (
          <Button asChild className="mt-8">
            <Link href="/">{actionLabel}</Link>
          </Button>
        )}
      </div>
    </Container>
  </main>
);
