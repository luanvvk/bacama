import { getTranslations } from 'next-intl/server';

import { LegalDocument, type LegalSection } from '@/app/(storefront)/_components/LegalDocument';
import { Footer } from '@/components/layout/Footer';
import { BUSINESS_CONTACT } from '@/constants/business';

const AccessibilityPage = async () => {
  const t = await getTranslations('AccessibilityPage');
  const sections = t.raw('sections') as LegalSection[];
  sections[sections.length - 1].paragraphs = [
    t('contactParagraph', { email: BUSINESS_CONTACT.email, phone: BUSINESS_CONTACT.phone }),
  ];

  return (
    <>
      <LegalDocument
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        updated={t('updatedDate')}
        sections={sections}
      />
      <Footer />
    </>
  );
};

export default AccessibilityPage;
