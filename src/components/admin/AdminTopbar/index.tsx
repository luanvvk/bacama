'use client';

import Link from 'next/link';
import { Menu, Search, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';

export const AdminTopbar = () => {
  return (
    <div className="dark bg-background text-foreground flex h-14 shrink-0 items-center gap-4 border-b px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open admin menu"
            className="lg:hidden"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Admin menu</SheetTitle>
          </SheetHeader>
          <AdminMobileNav />
        </SheetContent>
      </Sheet>

      <Link href="/admin" className="flex flex-col leading-none">
        <span className="font-heading text-lg">
          Bacama<span className="text-primary">·</span>
        </span>
        <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          Admin
        </span>
      </Link>

      <form action="/admin/orders" role="search" className="relative max-w-sm flex-1">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          name="q"
          placeholder="Search orders…"
          aria-label="Search orders"
          className="pl-9"
        />
      </form>

      <Button type="button" variant="ghost" size="icon" aria-label="Account" className="ml-auto">
        <UserRound />
      </Button>
    </div>
  );
};
