'use client';

import Link from 'next/link';
import { Show, useClerk } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';

import { ACCOUNT_MENU_ITEMS, STAFF_MENU_ITEMS } from '@/constants/account-menu';
import { NAV_ITEMS, type NavItem } from '@/constants/nav';
import type { Role } from '@/lib/providers/auth/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';

export interface MobileNavProps {
  navItems?: NavItem[];
  role?: Role | null;
}

export const MobileNav = ({ navItems = NAV_ITEMS, role = null }: MobileNavProps) => {
  const t = useTranslations('AccountMenu');
  const { signOut } = useClerk();
  const isStaff = role != null && role !== 'customer';

  return (
    <nav className="flex flex-col gap-1">
      <Accordion type="multiple">
        {navItems
          .filter((item) => item.columns)
          .map((item) => (
            <AccordionItem key={item.href} value={item.href}>
              <AccordionTrigger className="font-heading text-base">{item.label}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3">
                  {item.columns?.map((column) => (
                    <div key={column.heading}>
                      <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                        {column.heading}
                      </p>
                      <div className="mt-2 flex flex-col gap-2">
                        {column.links.map((link) => (
                          <Link key={link.label} href={link.href} className="text-sm">
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>

      {navItems
        .filter((item) => !item.columns)
        .map((item) => (
          <Link key={item.href} href={item.href} className="font-heading border-b py-2.5 text-base">
            {item.label}
          </Link>
        ))}

      <div className="mt-6 flex flex-col gap-2">
        <Show when="signed-out">
          <Button asChild className="w-full">
            <Link href="/login">{t('signIn')}</Link>
          </Button>
        </Show>
        <Show when="signed-in">
          {ACCOUNT_MENU_ITEMS.map(({ labelKey, href }) => (
            <Button key={href} asChild variant="outline" size="sm" className="w-full">
              <Link href={href}>{t(labelKey)}</Link>
            </Button>
          ))}
          {isStaff &&
            STAFF_MENU_ITEMS.map(({ labelKey, href }) => (
              <Button key={href} asChild variant="outline" size="sm" className="w-full">
                <Link href={href}>{t(labelKey)}</Link>
              </Button>
            ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => void signOut({ redirectUrl: '/' })}
          >
            {t('logOut')}
          </Button>
        </Show>
      </div>
    </nav>
  );
};
