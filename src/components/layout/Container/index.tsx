import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type ContainerProps = HTMLAttributes<HTMLDivElement>;

export const Container = ({ className, ...props }: ContainerProps) => (
  <div className={cn('mx-auto max-w-7xl px-4 sm:px-6', className)} {...props} />
);
