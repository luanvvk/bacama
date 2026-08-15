import { LegalDocument } from '@/app/(storefront)/_components/LegalDocument';
import { Footer } from '@/components/layout/Footer';

const sections = [
  {
    title: '1. Introduction',
    paragraphs: [
      'Bacama is a small roastery, bakery, café group, and online learning studio based in Đà Nẵng, Vietnam. This policy explains what personal information we collect, why we collect it, and the choices you have.',
      'We are not a large platform. We collect only what helps us take an order, answer a message, arrange delivery, or save your learning progress. We do not sell personal information.',
    ],
  },
  {
    title: '2. What we collect',
    paragraphs: [
      'When you place an order: your name, phone number, email, delivery address, order details, and payment method (payment card details are handled by the payment provider, not by us).',
      'When you contact us: your name, email, phone number if you provide it, and the content of your message.',
      'When you subscribe to the newsletter: your email address and subscription preference.',
      'When you create an account or enrol in a course: your name, email, course progress, and assessment submissions.',
      'When you browse the site: technical information such as browser type, pages visited, and time spent, collected through cookies and similar technologies (see our cookie policy for details).',
    ],
  },
  {
    title: '3. Legal basis and purpose',
    paragraphs: [
      'We process your information to fulfil orders you place (contract), to answer messages you send (consent), to send the newsletter you subscribed to (consent), and to improve the site (legitimate interest).',
      'If you are in Vietnam, your data is handled in accordance with the Law on Protection of Personal Data (Decree 13/2023/ND-CP). If you are in the EU or UK, we handle your data under the GDPR principles of lawfulness, fairness, and transparency.',
    ],
  },
  {
    title: '4. How we use your information',
    paragraphs: [
      'To process and deliver your orders, arrange shipping, and handle returns.',
      'To grant course access, track progress, and issue certificates.',
      'To answer support requests and messages you send us.',
      'To send the newsletter you subscribed to (you can unsubscribe at any time).',
      'To understand which products and pages are popular, so we can make the site better.',
    ],
  },
  {
    title: '5. Payment and delivery providers',
    paragraphs: [
      'Payment providers (ZaloPay, MoMo, VNPay, Visa, bank transfer) receive the information they need to process your payment, including your name and the payment amount. Card details are handled entirely by the payment provider — Bacama never sees or stores them.',
      'Delivery couriers (GHN, Ahamove, GrabExpress) receive your name, phone number, and delivery address to complete the shipment.',
    ],
  },
  {
    title: '6. How long we keep your data',
    paragraphs: [
      'Order details are kept for as long as needed to fulfil the order and handle any returns, plus a reasonable period for accounting and tax records.',
      'Newsletter subscriptions are kept until you unsubscribe.',
      'Course progress and certificates are kept as long as your account is active.',
      'Messages sent through the contact form are kept for up to 12 months, then deleted.',
    ],
  },
  {
    title: '7. Sharing',
    paragraphs: [
      'We do not sell your personal information. We share it only with the providers listed in section 5, and only to the extent necessary to complete the service you requested.',
      'We may be required to disclose information to authorities if compelled by law.',
    ],
  },
  {
    title: '8. Your rights',
    paragraphs: [
      'You can ask what information we hold about you, request a correction or deletion, unsubscribe from the newsletter, or object to a specific use.',
      'To exercise any of these rights, contact hang@bacama.vn. We will respond within 30 days.',
    ],
  },
  {
    title: '9. Children',
    paragraphs: [
      'The site is not directed at children under 13. We do not knowingly collect information from children. If you believe a child has provided us with information, contact us and we will delete it.',
    ],
  },
  {
    title: '10. Data transfer',
    paragraphs: [
      'Your data may be processed on servers located outside Vietnam or your home country. Where this happens, appropriate safeguards are in place to protect your information.',
    ],
  },
  {
    title: '11. Changes to this policy',
    paragraphs: [
      'We may update this policy when the services we offer change. The date shown on this page indicates the version currently in effect.',
    ],
  },
  {
    title: '12. Contact',
    paragraphs: [
      'Questions about privacy? Email hang@bacama.vn or write to Bacama, 27 Ngô Quyền, Hải Châu, Đà Nẵng, Vietnam. We answer during opening hours, 07:00–19:00, every day.',
    ],
  },
];

const PrivacyPage = () => (
  <>
    <LegalDocument
      eyebrow="Privacy · what we keep"
      title="Privacy policy."
      description="We collect only what helps us take an order, answer a message, or save your learning progress. This is the full and honest version of what we keep, why, and for how long."
      updated="16 August 2026"
      sections={sections}
    />
    <Footer />
  </>
);

export default PrivacyPage;
