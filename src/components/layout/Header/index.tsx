'use client';

import Link from 'next/link';
import { Menu, ShoppingBag } from 'lucide-react';

import { NAV_ITEMS } from '@/constants/nav';
import { useCartCount, useCartStore } from '@/stores/cart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/NavigationMenu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { AccountMenu } from '@/components/layout/AccountMenu';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/layout/Logo';
import { MobileNav } from '@/components/layout/MobileNav';

export const Header = () => {
  const cartCount = useCartCount();
  const openCart = useCartStore((state) => state.open);

  return (
    <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />

        <NavigationMenu viewport={false} className="hidden lg:flex">
          <NavigationMenuList>
            {NAV_ITEMS.map((item) =>
              item.columns ? (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuTrigger className="font-mono text-xs tracking-widest uppercase">
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[520px] grid-cols-2 gap-6 p-4">
                      {item.columns.map((column) => (
                        <div key={column.heading}>
                          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                            {column.heading}
                          </p>
                          <ul className="mt-2 flex flex-col gap-1">
                            {column.links.map((link) => (
                              <li key={link.label}>
                                <NavigationMenuLink asChild>
                                  <Link href={link.href} className="flex-col items-start">
                                    <span className="text-sm">{link.label}</span>
                                    {link.description && (
                                      <span className="text-muted-foreground text-xs">
                                        {link.description}
                                      </span>
                                    )}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link href={item.href} className="font-mono text-xs tracking-widest uppercase">
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open cart"
            className="relative"
            onClick={openCart}
          >
            <ShoppingBag />
            {cartCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1"
              >
                {cartCount}
              </Badge>
            )}
          </Button>

          <div className="hidden lg:block">
            <AccountMenu />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="lg:hidden"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <MobileNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
};
