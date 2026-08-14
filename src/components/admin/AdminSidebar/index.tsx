import Link from 'next/link';

import { ADMIN_NAV } from '@/constants/admin';
import { Badge } from '@/components/ui/Badge';

export const AdminSidebar = () => (
  <nav className="hidden w-60 shrink-0 border-r p-4 lg:block">
    {ADMIN_NAV.map((section) => (
      <div key={section.heading} className="mb-6">
        <p className="text-muted-foreground mb-2 px-2.5 font-mono text-xs tracking-widest uppercase">
          {section.heading}
        </p>
        <ul className="flex flex-col gap-0.5">
          {section.items.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="bg-primary/10 text-primary flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium"
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {item.count !== undefined && (
                      <span className="font-mono text-xs">{item.count}</span>
                    )}
                  </Link>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm">
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {item.count !== undefined && (
                      <span className="font-mono text-xs">{item.count}</span>
                    )}
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
