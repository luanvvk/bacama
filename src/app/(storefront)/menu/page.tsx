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

// `section` is a locale-neutral key on MenuItem, not editorial copy —
// translated to a display heading here rather than via a full i18n system
// that doesn't exist yet (see ProductCard's CATEGORY_LABEL for the same
// pattern).
const SECTION_LABELS: Record<string, string> = {
  phin: 'Vietnamese',
  espresso: 'Espresso',
  hand_brew: 'Hand Brew',
  cold_brew: 'Signature Cold Brew',
  tea: 'Trà · Tea',
  matcha: 'Japanese Matcha',
  chocolate: 'Chocolate',
  juice: 'Refresher',
};

const SECTION_ORDER = Object.keys(SECTION_LABELS);

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

const ANNOUNCEMENTS = ['Order ahead, collect at Lý Tự Trọng', 'One size, every drink'];

const MenuPage = async () => {
  const items = await getMenuItems();
  const sections = groupBySection(items);

  return (
    <>
      <AnnouncementBar items={ANNOUNCEMENTS} />
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Menu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="py-8">
            <Heading as="h1" size="lg">
              Drinks menu
            </Heading>
            <Text variant="muted" className="mt-2 max-w-2xl">
              Order ahead and collect at the café — pickup only, no delivery for drinks.
            </Text>

            <MenuSections sections={sections} sectionLabels={SECTION_LABELS} />
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default MenuPage;
