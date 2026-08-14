import { type BrewGuide } from '@/constants/products';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export interface ProductTabsProps {
  brewGuide?: BrewGuide[];
  originStory?: string;
}

const SHIPPING_COPY =
  'GHN nationwide in 2–3 days, free over 500,000 ₫. Collect at a café within 2 hours. ' +
  'Opened bags cannot be returned, but if a batch is off, message us on Zalo and we will send a fresh bag.';

export const ProductTabs = ({ brewGuide, originStory }: ProductTabsProps) => (
  <Tabs defaultValue={brewGuide ? 'brew' : 'shipping'} className="mt-12 border-t pt-8">
    <TabsList variant="line">
      {brewGuide && <TabsTrigger value="brew">How to brew</TabsTrigger>}
      {originStory && <TabsTrigger value="origin">Origin</TabsTrigger>}
      <TabsTrigger value="shipping">Shipping & returns</TabsTrigger>
    </TabsList>

    {brewGuide && (
      <TabsContent value="brew">
        <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {brewGuide.map((guide) => (
            <div key={guide.method} className="rounded-lg border p-4">
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {guide.method}
              </p>
              <p className="font-mono text-sm font-semibold">{guide.ratio}</p>
              <p className="text-muted-foreground mt-1 text-xs">{guide.detail}</p>
            </div>
          ))}
        </div>
      </TabsContent>
    )}

    {originStory && (
      <TabsContent value="origin">
        <p className="text-muted-foreground max-w-prose py-6 text-sm">{originStory}</p>
      </TabsContent>
    )}

    <TabsContent value="shipping">
      <p className="text-muted-foreground max-w-prose py-6 text-sm">{SHIPPING_COPY}</p>
    </TabsContent>
  </Tabs>
);
