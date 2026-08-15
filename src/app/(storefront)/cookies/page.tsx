import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Text } from '@/components/ui/Typography';

const SECTIONS = [
  { id: 'what-are-cookies', title: 'What are cookies' },
  { id: 'types-we-use', title: 'Types of cookies we use' },
  { id: 'essential', title: 'Essential cookies' },
  { id: 'preferences', title: 'Preference cookies' },
  { id: 'analytics', title: 'Analytics cookies' },
  { id: 'third-party', title: 'Third-party cookies' },
  { id: 'cookie-table', title: 'Cookies we set' },
  { id: 'manage', title: 'How to manage cookies' },
  { id: 'contact', title: 'Contact' },
];

const COOKIE_TABLE = [
  [
    'bacama-entrance-seen',
    'Local Storage',
    'Session',
    'No',
    'Remembers whether you have seen the entrance welcome.',
  ],
  [
    'bacama.locale',
    'Local Storage',
    'Persistent',
    'No',
    'Stores your language preference (future feature).',
  ],
  ['cart', 'Zustand store', 'Session', 'No', 'Keeps your shopping cart contents while you browse.'],
  [
    '__session',
    'Cookie',
    'Session',
    'Yes',
    'Identifies your browsing session for cart and checkout.',
  ],
  [
    '_ga',
    'Cookie',
    '730 days',
    'Yes',
    'Used by Google Analytics to distinguish visitors (added when connected).',
  ],
  [
    '_gid',
    'Cookie',
    '1 day',
    'Yes',
    'Used by Google Analytics to distinguish visitors (added when connected).',
  ],
];

const CookiesPage = () => (
  <>
    <StaticPageShell
      eyebrow="Cookies · a quiet explanation"
      title="Cookie policy."
      description="We use a minimal amount of cookies and browser storage to make the shop work and remember choices you make. This page explains what we set, why we set it, and how you can control it."
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-16">
          <aside className="h-fit border-b pb-5 lg:sticky lg:top-24 lg:border-b-0 lg:border-l lg:pb-0 lg:pl-5">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              On this page
            </p>
            <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 lg:flex-col">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {section.title}
                </a>
              ))}
            </nav>
            <p className="text-muted-foreground mt-6 font-mono text-xs uppercase">
              Updated · 16 August 2026
            </p>
          </aside>

          <article className="space-y-12">
            <section id="what-are-cookies" className="scroll-mt-24">
              <h2 className="font-heading text-2xl sm:text-3xl">
                What are cookies and similar technologies
              </h2>
              <Text className="text-muted-foreground mt-4">
                Cookies are small text files placed on your device when you visit a website. They
                let the site remember things — what is in your cart, whether you have seen a message
                before, or how you found us. We also use browser storage (local storage and session
                storage) for similar purposes; it works like a cookie but can hold slightly more
                information without being sent with every request.
              </Text>
            </section>

            <section id="types-we-use" className="scroll-mt-24">
              <h2 className="font-heading text-2xl sm:text-3xl">Types of cookies we use</h2>
              <Text className="text-muted-foreground mt-4">
                We categorise the cookies and storage we use into four types. Only the first
                (essential) is set automatically. The rest are added when the corresponding service
                is connected.
              </Text>
              <div className="mt-6 space-y-3">
                {[
                  [
                    'Essential',
                    'Required for the site to function. Without these, the cart and checkout do not work.',
                  ],
                  [
                    'Preference',
                    'Remember your choices — like whether you have seen the entrance welcome — to make the site feel smoother.',
                  ],
                  [
                    'Analytics',
                    'Help us understand which pages are useful and where we can improve. Anonymous or pseudonymous.',
                  ],
                  [
                    'Marketing',
                    'Used to show relevant content on third-party platforms. Added only if you engage with those features.',
                  ],
                ].map(([type, description]) => (
                  <div key={type} className="grid grid-cols-[120px_1fr] gap-4 border-b pb-3">
                    <p className="text-primary font-mono text-xs tracking-widest uppercase">
                      {type}
                    </p>
                    <Text variant="muted">{description}</Text>
                  </div>
                ))}
              </div>
            </section>

            <section id="essential" className="scroll-mt-24">
              <h2 className="font-heading text-2xl sm:text-3xl">Essential cookies</h2>
              <Text className="text-muted-foreground mt-4">
                These are set automatically and cannot be turned off if you want to use the shop.
                They do not identify you to us or to anyone else.
              </Text>
            </section>

            <section id="preferences" className="scroll-mt-24">
              <h2 className="font-heading text-2xl sm:text-3xl">Preference cookies</h2>
              <Text className="text-muted-foreground mt-4">
                The entrance welcome uses local storage to remember whether you have already seen
                it, so it does not show every time you visit. This does not identify you to us.
              </Text>
            </section>

            <section id="analytics" className="scroll-mt-24">
              <h2 className="font-heading text-2xl sm:text-3xl">Analytics cookies</h2>
              <Text className="text-muted-foreground mt-4">
                When an analytics service is connected, it may set cookies to understand how the
                site is used — which pages are visited, how long people stay, and where they come
                from. This data is anonymous or pseudonymous and is used only to improve the site.
              </Text>
            </section>

            <section id="third-party" className="scroll-mt-24">
              <h2 className="font-heading text-2xl sm:text-3xl">Third-party cookies</h2>
              <Text className="text-muted-foreground mt-4">
                Payment providers (ZaloPay, MoMo, VNPay, Visa), delivery couriers (GHN, Ahamove,
                GrabExpress), and embedded media may set their own cookies when you interact with
                those services. Their policies, not ours, govern those cookies.
              </Text>
            </section>

            <section id="cookie-table" className="scroll-mt-24">
              <h2 className="font-heading text-2xl sm:text-3xl">Cookies we set</h2>
              <Text className="text-muted-foreground mt-4">
                The table below lists the cookies and storage currently used or planned. It will be
                updated as services are connected.
              </Text>
            </section>
          </article>
        </div>

        <section id="cookie-table-content" className="mt-8 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Third-party</TableHead>
                <TableHead>Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COOKIE_TABLE.map(([name, type, duration, thirdParty, purpose]) => (
                <TableRow key={name}>
                  <TableCell className="font-mono text-xs">{name}</TableCell>
                  <TableCell className="text-xs">{type}</TableCell>
                  <TableCell className="text-xs">{duration}</TableCell>
                  <TableCell className="text-xs">{thirdParty}</TableCell>
                  <TableCell>
                    <Text variant="muted">{purpose}</Text>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <div className="mt-12 grid gap-8 border-t pt-8 sm:grid-cols-2">
          <section id="manage" className="scroll-mt-24">
            <h2 className="font-heading text-2xl">How to manage cookies</h2>
            <Text className="text-muted-foreground mt-4">
              You can clear cookies and local storage from your browser settings at any time. On
              most browsers, this is under Settings → Privacy → Site data or similar. Clearing site
              storage may empty your local cart or show the entrance message again the next time you
              visit.
            </Text>
            <Text className="text-muted-foreground mt-4">
              You can also browse in private or incognito mode, which clears storage when you close
              the window.
            </Text>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="font-heading text-2xl">Contact</h2>
            <Text className="text-muted-foreground mt-4">
              Questions about cookies or privacy? Email hang@bacama.vn and we will answer during
              opening hours.
            </Text>
          </section>
        </div>
      </Container>
    </StaticPageShell>
    <Footer />
  </>
);

export default CookiesPage;
