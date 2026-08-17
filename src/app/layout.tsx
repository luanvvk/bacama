import type { Metadata } from 'next';
import { Fraunces, Be_Vietnam_Pro } from 'next/font/google';
import { Toaster } from '@/components/ui/Toaster';
import './globals.css';

const fraunces = Fraunces({
  variable: '--font-heading',
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Bacama',
  description: 'Bakery & online courses e-commerce platform',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${fraunces.variable} ${beVietnamPro.variable} h-full antialiased`}>
    <body className="flex min-h-full flex-col">
      {children}
      <Toaster />
    </body>
  </html>
);

export default RootLayout;
