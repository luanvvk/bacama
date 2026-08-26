'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

export interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export const ProductGallery = ({ images, alt }: ProductGalleryProps) => {
  const t = useTranslations('Product');
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="grid grid-cols-[72px_1fr] gap-3">
      <div className="flex flex-col gap-2">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-pressed={index === activeIndex}
            aria-label={t('showImage', { index: index + 1 })}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'aspect-square overflow-hidden rounded-sm border',
              index === activeIndex ? 'border-primary' : 'border-border',
            )}
          >
            <Image src={image} alt="" width={72} height={72} className="size-full object-cover" />
          </button>
        ))}
      </div>
      <div className="bg-muted relative aspect-4/5 overflow-hidden rounded-lg">
        <Image
          src={images[activeIndex]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
};
