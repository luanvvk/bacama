import { getTranslations } from 'next-intl/server';

import { type BrewGuide } from '@/constants/products';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export interface ProductTabsProps {
  brewGuide?: BrewGuide[];
  originStory?: string;
}

export const ProductTabs = async ({ brewGuide, originStory }: ProductTabsProps) => {
  const t = await getTranslations('Product');

  return (
    <Tabs defaultValue={brewGuide ? 'brew' : 'shipping'} className="mt-12 border-t pt-8">
      <TabsList variant="line">
        {brewGuide && <TabsTrigger value="brew">{t('tabBrew')}</TabsTrigger>}
        {originStory && <TabsTrigger value="origin">{t('tabOrigin')}</TabsTrigger>}
        <TabsTrigger value="shipping">{t('tabShipping')}</TabsTrigger>
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
        <p className="text-muted-foreground max-w-prose py-6 text-sm">{t('shippingCopy')}</p>
      </TabsContent>
    </Tabs>
  );
};
