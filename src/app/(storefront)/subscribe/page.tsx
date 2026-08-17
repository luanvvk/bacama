import { NewsletterForm } from '@/app/(storefront)/_components/NewsletterForm';
import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const SubscribePage = () => (
  <>
    <StaticPageShell
      eyebrow="A note from the roastery"
      title="The good stuff, occasionally."
      description="New roast dates, early-bake notes, workshop places, and the occasional story from the farms. No noise, no daily discount code."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)] lg:items-start lg:gap-16">
        <div className="max-w-xl">
          <p className="text-primary font-mono text-xs tracking-widest uppercase">What arrives</p>
          <h2 className="font-heading mt-3 text-3xl">A small note, not a campaign.</h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            We write when there is something worth knowing: a fresh lot, a new class date, or a
            morning at one of the farms we buy from.
          </p>
          <div className="mt-10 grid gap-5 border-t pt-6 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['01', 'Roast notes', 'What is in the drum and why it tastes that way.'],
              ['02', 'Class openings', 'A quiet heads-up before weekend seats disappear.'],
              ['03', 'Café news', 'New rooms, early bakes, and people worth meeting.'],
            ].map(([number, title, description]) => (
              <div key={number} className="grid grid-cols-[32px_1fr] gap-3">
                <p className="text-primary font-mono text-xs">{number}</p>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Join the Bacama letter</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsletterForm />
            <p className="text-muted-foreground mt-4 text-xs">
              By subscribing, you agree to receive Bacama updates. Unsubscribe whenever you like.
            </p>
          </CardContent>
        </Card>
      </div>
    </StaticPageShell>
    <Footer />
  </>
);

export default SubscribePage;
