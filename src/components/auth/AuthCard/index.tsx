import Link from 'next/link';
import { type ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

export interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export const AuthCard = ({ title, description, children, footer }: AuthCardProps) => (
  <div className="mx-auto flex max-w-sm flex-col py-16">
    <div className="text-center">
      <Link href="/" className="font-heading text-2xl">
        Bacama<span className="text-primary">·</span>
      </Link>
      <Heading as="h1" size="sm" className="mt-6">
        {title}
      </Heading>
      <Text variant="muted" className="mt-2">
        {description}
      </Text>
    </div>

    <Card className="mt-8">
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>

    <p className="text-muted-foreground mt-6 text-center text-sm">{footer}</p>
  </div>
);
