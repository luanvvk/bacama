// Real contact facts for the one open café, used by static and legal copy that
// isn't (and needn't be) a database read. The authoritative source is the
// `ly-tu-trong` Site row in Postgres — change both together. Every value here
// is the business's own: the address and hours come from its live GrabFood
// listing, the hotline from its own printed price sheet.
//
// `email` is the one value inherited from the design mockups and never
// verified against the real business — see docs/BUILD-PLAN.md B0-c.
export const BUSINESS_CONTACT = {
  siteSlug: 'ly-tu-trong',
  siteName: 'Lý Tự Trọng',
  /** Short form, for cards and footers. */
  addressShort: 'K154/6 Lý Tự Trọng, Hải Châu, Đà Nẵng',
  /** Full form, for legal copy and postal use. */
  addressFull: 'K154/6 Lý Tự Trọng, Phường Thanh Bình, Quận Hải Châu, Đà Nẵng',
  hours: '07:00 – 21:00 · every day',
  phone: '0934 856 938',
  phoneHref: 'tel:+84934856938',
  email: 'hang@bacama.vn',
} as const;
