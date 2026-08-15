import Link from 'next/link';

import { ContactForm } from '@/app/(storefront)/_components/ContactForm';
import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const ContactPage = () => (
  <>
    <StaticPageShell
      eyebrow="Contact · 07:00–19:00 daily"
      title="Come by, call, or write."
      description="Questions about a roast, a course, or a birthday cake? A real person reads every message."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Ngô Quyền · Site 01</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                27 Ngô Quyền, Hải Châu
                <br />
                Đà Nẵng
              </p>
              <p className="text-muted-foreground">07:00–19:00 · every day</p>
              <Button asChild variant="link" className="px-0">
                <Link href="tel:+842360000000">+84 236 000 0000</Link>
              </Button>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Prefer email?</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="mailto:hang@bacama.vn">hang@bacama.vn</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StaticPageShell>
    <Footer />
  </>
);

export default ContactPage;
