'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ADMIN_NAV } from '@/constants/admin';
import { Badge } from '@/components/ui/Badge';
import { SheetClose } from '@/components/ui/Sheet';
import { cn } from '@/lib/utils';

export const AdminMobileNav = () => {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-6 p-4">
      {ADMIN_NAV.map((section) => (
        <div key={section.heading}>
          <p className="text-muted-foreground mb-2 px-2 font-mono text-xs tracking-widest uppercase">
            {section.heading}
          </p>
          <ul className="flex flex-col gap-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === pathname;

              return (
                <li key={item.label}>
                  {item.href ? (
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                          isActive && 'bg-primary/10 text-primary font-medium',
                        )}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                        {item.count !== undefined && (
                          <span className="font-mono text-xs">{item.count}</span>
                        )}
                      </Link>
                    </SheetClose>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      <Badge variant="outline">Soon</Badge>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};
