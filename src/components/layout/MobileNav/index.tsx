import Link from 'next/link';

import { NAV_ITEMS } from '@/constants/nav';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';

export const MobileNav = () => (
  <nav className="flex flex-col gap-1">
    <Accordion type="multiple">
      {NAV_ITEMS.filter((item) => item.columns).map((item) => (
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

    {NAV_ITEMS.filter((item) => !item.columns).map((item) => (
      <Link key={item.href} href={item.href} className="font-heading border-b py-2.5 text-base">
        {item.label}
      </Link>
    ))}

    <div className="mt-6 flex flex-col gap-2">
      <Button asChild className="w-full">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href="/teach">Teacher console</Link>
      </Button>
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href="/admin">Admin console</Link>
      </Button>
    </div>
  </nav>
);
