import { getTranslations } from 'next-intl/server';

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
import { BUSINESS_CONTACT } from '@/constants/business';

const CookiesPage = async () => {
  const t = await getTranslations('CookiesPage');
  const sections = t.raw('sections') as { id: string; title: string }[];
  const cookieTypes = t.raw('cookieTypes') as { type: string; description: string }[];
  const cookieTable = t.raw('cookieTable') as {
    name: string;
    type: string;
    duration: string;
    thirdParty: string;
    purpose: string;
  }[];
  const contactParagraph = t('contactParagraph', { email: BUSINESS_CONTACT.email });

  return (
    <>
      <StaticPageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-16">
            <aside className="h-fit border-b pb-5 lg:sticky lg:top-24 lg:border-b-0 lg:border-l lg:pb-0 lg:pl-5">
              <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                {t('onThisPage')}
              </p>
              <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 lg:flex-col">
                {sections.map((section) => (
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
                {t('updatedDate')}
              </p>
            </aside>

            <article className="space-y-12">
              <section id="what-are-cookies" className="scroll-mt-24">
                <h2 className="font-heading text-2xl sm:text-3xl">{t('whatAreCookiesTitle')}</h2>
                <Text className="text-muted-foreground mt-4">{t('whatAreCookiesBody')}</Text>
              </section>

              <section id="types-we-use" className="scroll-mt-24">
                <h2 className="font-heading text-2xl sm:text-3xl">{t('typesWeUseTitle')}</h2>
                <Text className="text-muted-foreground mt-4">{t('typesWeUseBody')}</Text>
                <div className="mt-6 space-y-3">
                  {cookieTypes.map(({ type, description }) => (
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
                <h2 className="font-heading text-2xl sm:text-3xl">{t('essentialTitle')}</h2>
                <Text className="text-muted-foreground mt-4">{t('essentialBody')}</Text>
              </section>

              <section id="preferences" className="scroll-mt-24">
                <h2 className="font-heading text-2xl sm:text-3xl">{t('preferencesTitle')}</h2>
                <Text className="text-muted-foreground mt-4">{t('preferencesBody')}</Text>
              </section>

              <section id="analytics" className="scroll-mt-24">
                <h2 className="font-heading text-2xl sm:text-3xl">{t('analyticsTitle')}</h2>
                <Text className="text-muted-foreground mt-4">{t('analyticsBody')}</Text>
              </section>

              <section id="third-party" className="scroll-mt-24">
                <h2 className="font-heading text-2xl sm:text-3xl">{t('thirdPartyTitle')}</h2>
                <Text className="text-muted-foreground mt-4">{t('thirdPartyBody')}</Text>
              </section>

              <section id="cookie-table" className="scroll-mt-24">
                <h2 className="font-heading text-2xl sm:text-3xl">{t('cookieTableTitle')}</h2>
                <Text className="text-muted-foreground mt-4">{t('cookieTableBody')}</Text>
              </section>
            </article>
          </div>

          <section id="cookie-table-content" className="mt-8 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableColumnName')}</TableHead>
                  <TableHead>{t('tableColumnType')}</TableHead>
                  <TableHead>{t('tableColumnDuration')}</TableHead>
                  <TableHead>{t('tableColumnThirdParty')}</TableHead>
                  <TableHead>{t('tableColumnPurpose')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cookieTable.map(({ name, type, duration, thirdParty, purpose }) => (
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
              <h2 className="font-heading text-2xl">{t('manageTitle')}</h2>
              <Text className="text-muted-foreground mt-4">{t('manageBodyOne')}</Text>
              <Text className="text-muted-foreground mt-4">{t('manageBodyTwo')}</Text>
            </section>

            <section id="contact" className="scroll-mt-24">
              <h2 className="font-heading text-2xl">{t('contactTitle')}</h2>
              <Text className="text-muted-foreground mt-4">{contactParagraph}</Text>
            </section>
          </div>
        </Container>
      </StaticPageShell>
      <Footer />
    </>
  );
};

export default CookiesPage;
