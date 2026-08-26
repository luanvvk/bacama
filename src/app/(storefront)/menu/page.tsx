import { getTranslations } from 'next-intl/server';

import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getMenuItems, type MenuCatalogItem } from '@/services/catalog/get-menu-items';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { Heading, Text } from '@/components/ui/Typography';

import { MenuSections } from './_components/MenuSections';

export const revalidate = 3600;

// `section` is a locale-neutral key on MenuItem, not editorial copy — its
// display heading comes from messages/{en,vi}.json's Menu.sections (see
// ProductCard's CATEGORY_LABEL for the same category-key-to-label pattern).
const SECTION_ORDER = [
  'phin',
  'espresso',
  'hand_brew',
  'cold_brew',
  'tea',
  'matcha',
  'chocolate',
  'juice',
];

const groupBySection = (items: MenuCatalogItem[]) => {
  const bySection = new Map<string, MenuCatalogItem[]>();
  for (const item of items) {
    const group = bySection.get(item.section) ?? [];
    group.push(item);
    bySection.set(item.section, group);
  }
  return [...bySection.entries()].sort(
    ([a], [b]) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b),
  );
};

const MenuPage = async () => {
  const [t, tAnnouncements, items] = await Promise.all([
    getTranslations('Menu'),
    getTranslations('Announcements'),
    getMenuItems(),
  ]);
  const sections = groupBySection(items);
  const sectionLabels = t.raw('sections') as Record<string, string>;

  return (
    <>
      <AnnouncementBar items={tAnnouncements.raw('menu')} />
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t('breadcrumbHome')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('breadcrumbCurrent')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="py-8">
            <Heading as="h1" size="lg">
              {t('heading')}
            </Heading>
            <Text variant="muted" className="mt-2 max-w-2xl">
              {t('subtext')}
            </Text>

            <MenuSections sections={sections} sectionLabels={sectionLabels} />
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default MenuPage;
