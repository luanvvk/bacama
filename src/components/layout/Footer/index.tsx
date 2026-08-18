import Link from 'next/link';

import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/layout/Logo';
import { BUSINESS_CONTACT } from '@/constants/business';

const FOOTER_COLUMNS = [
  {
    // Real products. The previous three (Đà Lạt Washed / Sơn La Natural /
    // House Blend) were retired by the real-data seed, so every page's footer
    // carried three links that 404'd.
    heading: 'Coffee',
    links: [
      { label: '250g Bag · 100% Arabica', href: '/product/bag-arabica-250g' },
      { label: '250g Bag · 100% Robusta', href: '/product/bag-robusta-250g' },
      { label: 'Cold Brew Filter Bag', href: '/product/coldbrew-filter-arabica' },
      { label: 'All coffee', href: '/shop' },
    ],
  },
  {
    heading: 'Workshops',
    links: [
      { label: 'Barista foundations', href: '/courses' },
      { label: 'Latte art', href: '/courses' },
      { label: 'Viennoiserie', href: '/courses' },
      { label: 'Cupping', href: '/courses' },
    ],
  },
  {
    heading: 'Help & info',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Shipping & returns', href: '/shipping-returns' },
      { label: 'Subscribe', href: '/subscribe' },
      { label: 'Terms & privacy', href: '/terms' },
    ],
  },
  {
    heading: 'More Bacama',
    links: [
      { label: 'Wholesale', href: '/wholesale' },
      { label: 'Gift cards', href: '/gift-cards' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
  {
    heading: 'Contact',
    links: [] as { label: string; href: string }[],
  },
];

export interface FooterProps {
  variant?: 'full' | 'simple';
}

export const Footer = ({ variant = 'full' }: FooterProps) => (
  <footer className="bg-foreground text-background mt-auto">
    <Container className="py-10">
      {variant === 'full' && (
        <div className="grid grid-cols-1 gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))]">
          <div>
            <Logo />
            <p className="text-background/70 mt-4 text-sm">
              Small roastery, daily batches, an early bake — Đà Nẵng, 2017.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h4 className="font-heading text-sm">{column.heading}</h4>
              {column.heading === 'Help & info' || column.heading === 'More Bacama' ? (
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-background/70 hover:text-background">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : column.heading === 'Contact' ? (
                <ul className="text-background/70 mt-3 flex flex-col gap-2 text-sm">
                  <li>{BUSINESS_CONTACT.addressShort}</li>
                  <li>{BUSINESS_CONTACT.hours}</li>
                  <li>{BUSINESS_CONTACT.email}</li>
                  <li>{BUSINESS_CONTACT.phone}</li>
                </ul>
              ) : (
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-background/70 hover:text-background">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className={
          variant === 'full'
            ? 'text-background/60 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs'
            : 'text-background/60 flex flex-wrap items-center justify-between gap-2 text-xs'
        }
      >
        <p>© 2026 Bacama · Đà Nẵng business licence 0300/2026</p>
        <p>ZaloPay · MoMo · VNPay · COD · GHN</p>
      </div>
    </Container>
  </footer>
);
