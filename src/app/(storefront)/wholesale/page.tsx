import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import {
  CORE_LINE_BEANS,
  CORE_LINE_VOLUME_TIERS,
  OEM_PRICING,
  SIGNATURE_LINE_BEANS,
  SIGNATURE_LINE_VOLUME_TIERS,
  type WholesaleVolumeTier,
} from '@/constants/wholesale';
import { formatVnd } from '@/lib/format-price';
import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

const VolumeTierTable = ({
  beans,
  tiers,
  monthlyVolumeLabel,
}: {
  beans: { slug: string; name: string }[];
  tiers: WholesaleVolumeTier[];
  monthlyVolumeLabel: string;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>{monthlyVolumeLabel}</TableHead>
        {beans.map((bean) => (
          <TableHead key={bean.slug}>{bean.name}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {tiers.map((tier) => (
        <TableRow key={tier.volume}>
          <TableCell className="font-medium">{tier.volume}</TableCell>
          {beans.map((bean) => (
            <TableCell key={bean.slug}>
              {formatVnd(tier.pricesVnd[bean.slug]).replace(' ₫', '')}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const WholesalePage = async () => {
  const t = await getTranslations('WholesalePage');

  const deliveryAfterSales = t.raw('deliveryAfterSales') as string[];
  const creditTerms = t.raw('creditTerms') as string[];
  const reachUsLines = t.raw('reachUsLines') as string[];

  return (
    <>
      <StaticPageShell
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description', { hotline: '0934 856 938' })}
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('coreLineTitle')}</CardTitle>
              <Text variant="muted" className="mt-1 text-sm">
                {t('coreLineDescription')}
              </Text>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tableHeadBean')}</TableHead>
                    <TableHead>{t('tableHeadProcessSize')}</TableHead>
                    <TableHead>{t('tableHeadPricePerKg')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CORE_LINE_BEANS.map((bean) => (
                    <TableRow key={bean.slug}>
                      <TableCell className="font-medium">{bean.name}</TableCell>
                      <TableCell className="text-muted-foreground">{bean.process}</TableCell>
                      <TableCell>{formatVnd(bean.priceVnd)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Text variant="muted" className="mt-3 text-xs">
                {t('vatExcludedNote')}
              </Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('signatureLineTitle')}</CardTitle>
              <Text variant="muted" className="mt-1 text-sm">
                {t('signatureLineDescription')}
              </Text>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tableHeadBean')}</TableHead>
                    <TableHead>{t('tableHeadProcessSize')}</TableHead>
                    <TableHead>{t('tableHeadPricePerKg')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SIGNATURE_LINE_BEANS.map((bean) => (
                    <TableRow key={bean.slug}>
                      <TableCell className="font-medium">{bean.name}</TableCell>
                      <TableCell className="text-muted-foreground">{bean.process}</TableCell>
                      <TableCell>{formatVnd(bean.priceVnd)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Text variant="muted" className="mt-3 text-xs">
                {t('vatExcludedNote')}
              </Text>
            </CardContent>
          </Card>
        </div>

        <div className="mt-14">
          <Heading as="h2" size="md">
            {t('volumePricingHeading')}
          </Heading>
          <Text variant="muted" className="mt-2 max-w-2xl">
            {t('volumePricingDescription')}
          </Text>

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {t('coreLineTitle')}
              </p>
              <div className="mt-3">
                <VolumeTierTable
                  beans={CORE_LINE_BEANS}
                  tiers={CORE_LINE_VOLUME_TIERS}
                  monthlyVolumeLabel={t('tableHeadMonthlyVolume')}
                />
              </div>
            </div>
            <div>
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {t('signatureLineTitle')}
              </p>
              <div className="mt-3">
                <VolumeTierTable
                  beans={SIGNATURE_LINE_BEANS}
                  tiers={SIGNATURE_LINE_VOLUME_TIERS}
                  monthlyVolumeLabel={t('tableHeadMonthlyVolume')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <Heading as="h2" size="md">
              {t('oemHeading')}
            </Heading>
            <Text variant="muted" className="mt-2">
              {t('oemDescription')}
            </Text>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableHeadVolume')}</TableHead>
                  <TableHead>{t('tableHeadPricePerKg')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {OEM_PRICING.map((tier) => (
                  <TableRow key={tier.range}>
                    <TableCell className="font-medium">{tier.range}</TableCell>
                    <TableCell>{formatVnd(tier.pricePerKgVnd)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-accent rounded-lg p-6">
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              {t('deliveryAfterSalesEyebrow')}
            </p>
            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              {deliveryAfterSales.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <Heading as="h2" size="md">
              {t('creditTermsHeading')}
            </Heading>
            <ul className="text-muted-foreground mt-4 max-w-2xl space-y-3 text-sm">
              {creditTerms.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <Button asChild className="mt-7">
              <Link href="/contact">{t('startConversationCta')}</Link>
            </Button>
          </div>
          <div className="bg-accent rounded-lg p-6">
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              {t('reachUsEyebrow')}
            </p>
            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              {reachUsLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </StaticPageShell>
      <Footer />
    </>
  );
};

export default WholesalePage;
