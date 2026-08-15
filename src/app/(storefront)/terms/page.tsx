import { LegalDocument } from '@/app/(storefront)/_components/LegalDocument';
import { Footer } from '@/components/layout/Footer';

const sections = [
  {
    title: '1. About these terms',
    paragraphs: [
      'These terms govern your use of bacama.vn and any orders, course enrolments, or interactions you make through it. By browsing the site, placing an order, or creating an account, you accept these terms.',
      'If you do not agree with any part of these terms, please do not use the website. We may update these terms from time to time — the date shown on this page indicates the version currently in effect.',
    ],
  },
  {
    title: '2. Definitions',
    paragraphs: [
      '"Bacama", "we", "us", and "our" refer to the roastery, bakery, café, and online learning business operated from Đà Nẵng, Vietnam.',
      '"You" and "your" refer to the person browsing the site, placing an order, enrolling in a course, or contacting us.',
      '"Products" refers to coffee, bakery items, gift sets, and any other physical goods sold through the site.',
      '"Courses" refers to online or in-person classes, workshops, and learning content offered through the site.',
    ],
  },
  {
    title: '3. Use of the website',
    paragraphs: [
      'You may browse, place orders, and enrol in courses for personal or business use. You agree to provide accurate contact and delivery details and to use the site in a way that does not disrupt others or the service.',
      'You must not attempt to access areas of the site that are not intended for you, use the site for unlawful purposes, or reproduce content without permission. All site content — text, photography, course material, and design — is owned by Bacama unless otherwise stated.',
    ],
  },
  {
    title: '4. Accounts',
    paragraphs: [
      'An account is needed to save course progress, view order history, and receive certificates. When accounts are enabled, you are responsible for keeping your login details secure.',
      'Accounts are free. You may close your account at any time by contacting us. We may suspend or close an account if it is misused or if these terms are violated.',
    ],
  },
  {
    title: '5. Products and pricing',
    paragraphs: [
      'We make every effort to display products and prices accurately. Prices are shown in Vietnamese đồng and include applicable taxes. We reserve the right to correct pricing errors and to refuse or cancel an order if a price was displayed incorrectly.',
      'Product availability may change. If an item you ordered is no longer available, we will contact you to offer a substitute or a full refund.',
      'Coffee bags carry a roast date. Pastries and bakery items are made fresh daily and may sell out.',
    ],
  },
  {
    title: '6. Orders and payment',
    paragraphs: [
      'An order is accepted when payment is confirmed or, for cash-on-delivery (COD) orders, when we accept the order for dispatch. You will receive an order reference by email or the contact method you provided.',
      'We accept ZaloPay, MoMo, VNPay, Visa, bank transfer, and COD. For bank transfers, the order is held until the transfer is confirmed. Sufficient payment must be received before an order is dispatched.',
      'If a payment fails, we will contact you. Orders with unresolved payments for more than 24 hours may be cancelled automatically.',
    ],
  },
  {
    title: '7. Delivery and shipping',
    paragraphs: [
      'Orders are dispatched within 24 hours of confirmation or roasting. Nationwide delivery through GHN typically takes 2–3 business days. Local delivery in Đà Nẵng via Ahamove or GrabExpress may arrive same-day.',
      'Free shipping applies to orders above 500,000 ₫. Delivery times are estimates and may be affected by courier schedules, weather, or public holidays.',
      'Please ensure someone is available to receive the delivery at the address you provide. If a parcel is returned to us due to an incorrect address or failed delivery, we will contact you to arrange redelivery, which may incur an additional fee.',
    ],
  },
  {
    title: '8. Returns and refunds',
    paragraphs: [
      'Unopened coffee may be returned within 14 days of delivery. If a product arrives damaged or incorrect, contact us within 48 hours with a photo and we will arrange a replacement or refund.',
      'Perishable bakery items cannot be returned. If you are not satisfied with a bakery product, contact us and we will make it right.',
      'Refunds are processed to the original payment method and typically arrive within 5–10 business days, depending on your bank or payment provider.',
    ],
  },
  {
    title: '9. Courses and learning',
    paragraphs: [
      'Course access is granted to the enrolled person and should not be shared, transferred, or resold. Each course has a stated completion requirement, usually a set of lessons or an assessment.',
      'Certificates are issued upon successful completion. Bacama reserves the right to revoke a certificate if the assessment was completed dishonestly.',
      'Online course enrolments can be cancelled before the first lesson is watched for a full refund. In-person classes can be rescheduled with 7 days’ notice, subject to availability.',
    ],
  },
  {
    title: '10. Intellectual property',
    paragraphs: [
      'All content on this site — including text, photography, illustrations, course videos, lesson documents, logos, and design — is owned by Bacama or used with permission. You may not copy, download, or redistribute it without written consent.',
      'Course materials are provided for personal learning. Educators who wish to use Bacama materials in their own teaching should contact us first.',
    ],
  },
  {
    title: '11. Limitation of liability',
    paragraphs: [
      'Bacama is a small business, not a large platform. We take responsibility for delivering good products and honest service. To the extent permitted by Vietnamese law, our liability for any single order is limited to the value of that order.',
      'We are not liable for indirect or consequential losses, or for events beyond our reasonable control, such as courier delays, payment provider failures, or natural events.',
    ],
  },
  {
    title: '12. Force majeure',
    paragraphs: [
      'If circumstances beyond our control — such as extreme weather, supply chain failure, or government action — prevent us from fulfilling an order, we will contact you as soon as we can and arrange a refund or alternative.',
    ],
  },
  {
    title: '13. Changes to these terms',
    paragraphs: [
      'We may update these terms when the service changes. The version shown here applies to orders and enrolments placed after its update date. Previous versions are available on request.',
    ],
  },
  {
    title: '14. Governing law',
    paragraphs: [
      'These terms are governed by the laws of Vietnam. Any dispute that cannot be resolved by contacting us will be handled through the courts of Đà Nẵng or through good-faith mediation.',
    ],
  },
  {
    title: '15. Contact',
    paragraphs: [
      'If you have a question about these terms, an order, or a course, contact us at hang@bacama.vn or +84 236 000 0000. We answer during opening hours, 07:00–19:00, every day.',
    ],
  },
];

const TermsPage = () => (
  <>
    <LegalDocument
      eyebrow="Terms · the small print"
      title="Terms & conditions."
      description="The straightforward but complete version of how Bacama orders, courses, and accounts work. Written for humans, not just lawyers."
      updated="16 August 2026"
      sections={sections}
    />
    <Footer />
  </>
);

export default TermsPage;
