import { LegalDocument } from '@/app/(storefront)/_components/LegalDocument';
import { Footer } from '@/components/layout/Footer';

const AccessibilityPage = () => (
  <>
    <LegalDocument
      eyebrow="Accessibility · everyone is welcome"
      title="A shop made to be used."
      description="We want Bacama to work for as many people as possible, whether you are browsing with a keyboard, a screen reader, a small screen, or a slower connection."
      updated="16 August 2026"
      sections={[
        {
          title: 'Our approach',
          paragraphs: [
            'We aim to provide clear headings, labelled controls, readable contrast, keyboard access, meaningful link text, and alternative text for informative images.',
          ],
        },
        {
          title: 'Known limits',
          paragraphs: [
            'Some product photography and third-party payment or courier experiences may not meet the same standard as the rest of the site. We are working through these as integrations become real.',
          ],
        },
        {
          title: 'Need another way?',
          paragraphs: [
            'Email hang@bacama.vn or call +84 236 000 0000. We can take an order, answer a question, or help with a course without requiring you to use the website.',
          ],
        },
      ]}
    />
    <Footer />
  </>
);

export default AccessibilityPage;
