'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { Button } from '@/components/ui/Button';

const SESSION_KEY = 'bacama-entrance-seen';

const subscribe = () => () => {};
const getSnapshot = () => sessionStorage.getItem(SESSION_KEY) === '1';
// SSR has no session to check — default to "already seen" so nothing flashes before hydration corrects it.
const getServerSnapshot = () => true;

const POSTER_IMAGE =
  'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1500&q=68';

export const EntranceOverlay = () => {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const alreadySeen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const open = !dismissed && (searchParams.has('enter') || !alreadySeen);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setDismissed(true);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          className="dark fixed inset-0 z-50 outline-none"
          onEscapeKeyDown={dismiss}
        >
          <DialogPrimitive.Title className="sr-only">Welcome to Bacama</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            A small roastery in Đà Nẵng.
          </DialogPrimitive.Description>

          <div className="bg-background relative h-full w-full overflow-hidden">
            <Image src={POSTER_IMAGE} alt="" fill priority className="object-cover" />
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={POSTER_IMAGE}
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
            >
              <source src="/media/entrance.mp4" type="video/mp4" />
            </video>
            <div className="bg-background/75 absolute inset-0" aria-hidden="true" />

            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="font-heading text-4xl">
                Bacama<span className="text-primary">·</span>
              </p>
              <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                Coffee and more
              </p>
              <p className="text-muted-foreground max-w-md">
                A small roastery in Đà Nẵng. Bread before the light, coffee by the day&rsquo;s
                batch.
              </p>
              <Button size="lg" onClick={dismiss} className="mt-2">
                Enter the shop
              </Button>
              <Button variant="ghost" size="sm" onClick={dismiss}>
                Skip
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
