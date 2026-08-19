import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const cardMedia = cva('bg-muted relative block overflow-hidden rounded-lg', {
  variants: {
    aspect: {
      portrait: 'aspect-4/5',
      landscape: 'aspect-16/10',
      video: 'aspect-video',
    },
  },
  defaultVariants: { aspect: 'portrait' },
});

export interface CardMediaProps extends VariantProps<typeof cardMedia> {
  /** Real rows can have no photo yet; the fallback covers that, not a crash. */
  src?: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  fallback?: ReactNode;
  className?: string;
  /** Overlays drawn on top of the image — a sold-out veil, a play button. */
  children?: ReactNode;
}

export const CardMedia = ({
  src,
  alt,
  sizes,
  priority = false,
  zoom = true,
  aspect,
  fallback,
  className,
  children,
}: CardMediaProps) => (
  <div className={cn(cardMedia({ aspect }), className)}>
    {src ? (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          'object-cover',
          zoom && 'transition-transform duration-300 group-hover:scale-105',
        )}
      />
    ) : (
      fallback && (
        <div className="bg-secondary flex h-full w-full items-center justify-center">
          {fallback}
        </div>
      )
    )}
    {children}
  </div>
);
