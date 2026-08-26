import { getTranslations } from 'next-intl/server';

import { LegalDocument, type LegalSection } from '@/app/(storefront)/_components/LegalDocument';
import { Footer } from '@/components/layout/Footer';
import { BUSINESS_CONTACT } from '@/constants/business';

const PrivacyPage = async () => {
  const t = await getTranslations('PrivacyPage');

  const sections = t.raw('sections') as LegalSection[];
  sections[sections.length - 1] = {
    ...sections[sections.length - 1],
    paragraphs: [
      t('contactParagraph', {
        email: BUSINESS_CONTACT.email,
        address: BUSINESS_CONTACT.addressFull,
        hours: BUSINESS_CONTACT.hours,
      }),
    ],
  };

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

export default PrivacyPage;
