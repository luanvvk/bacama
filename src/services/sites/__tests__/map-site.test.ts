import { formatOpening, mapSite } from '../map-site';

const NOW = new Date('2026-08-18T09:00:00.000Z');

const site = {
  id: 'site-1',
  slug: 'ly-tu-trong',
  city: 'Đà Nẵng',
  nameVi: 'Lý Tự Trọng',
  nameEn: 'Ly Tu Trong',
  addressVi: 'K154/6 Lý Tự Trọng, Hải Châu, Đà Nẵng',
  addressEn: 'K154/6 Ly Tu Trong, Hai Chau, Da Nang',
  hoursVi: 'Hằng ngày · 07:00 – 21:00',
  hoursEn: 'Every day · 7 a.m. – 9 p.m.',
  timezone: 'Asia/Ho_Chi_Minh',
  imageUrl: 'https://example.com/site.webp',
  opensAt: null,
  isActive: true,
  createdAt: NOW,
  updatedAt: NOW,
  todaysRoastProductId: 'product-1',
  todaysRoastProduct: { slug: 'bag-arabica-250g', nameEn: 'Arabica 250g' },
  _count: { menuItems: 26, bakeryItems: 48 },
} satisfies Parameters<typeof mapSite>[0];

describe('mapSite', () => {
  it('maps a database site to the storefront site shape', () => {
    expect(mapSite(site, NOW)).toEqual({
      id: 'site-1',
      slug: 'ly-tu-trong',
      city: 'Đà Nẵng',
      name: 'Ly Tu Trong',
      address: 'K154/6 Ly Tu Trong, Hai Chau, Da Nang',
      addressNote: undefined,
      hoursDays: 'Every day',
      hoursTimes: '7 a.m. – 9 p.m.',
      imageUrl: 'https://example.com/site.webp',
      opensAt: null,
      comingSoon: false,
      servesMenu: true,
      servesBakery: true,
      todaysRoast: { slug: 'bag-arabica-250g', name: 'Arabica 250g' },
    });
  });

  it('splits an editorial aside off the address so it stays geocodable', () => {
    const withNote = {
      ...site,
      addressEn: '14 Phan Boi Chau, Minh An, Hoi An · Weekend cupping',
    };
    const result = mapSite(withNote, NOW);

    expect(result.address).toBe('14 Phan Boi Chau, Minh An, Hoi An');
    expect(result.addressNote).toBe('Weekend cupping');
  });

  it('leaves hours whole when there is no separator', () => {
    const result = mapSite({ ...site, hoursEn: 'Opens · 09.2026' }, NOW);

    expect(result.hoursDays).toBe('Opens');
    expect(result.hoursTimes).toBe('09.2026');
    expect(mapSite({ ...site, hoursEn: 'By appointment' }, NOW)).toMatchObject({
      hoursDays: 'By appointment',
      hoursTimes: undefined,
    });
  });

  it('marks a site with a future opensAt as coming soon', () => {
    const upcoming = { ...site, opensAt: new Date('2026-09-01T00:00:00.000Z') };

    expect(mapSite(upcoming, NOW).comingSoon).toBe(true);
  });

  it('treats a past opensAt as already open', () => {
    const opened = { ...site, opensAt: new Date('2026-01-01T00:00:00.000Z') };

    expect(mapSite(opened, NOW).comingSoon).toBe(false);
  });

  it('omits an unset image and roast rather than passing nulls through', () => {
    const bare = { ...site, imageUrl: null, todaysRoastProductId: null, todaysRoastProduct: null };
    const result = mapSite(bare, NOW);

    expect(result.imageUrl).toBeUndefined();
    expect(result.todaysRoast).toBeUndefined();
  });

  it('reports a site with no items of its own as serving neither', () => {
    const empty = { ...site, _count: { menuItems: 0, bakeryItems: 0 } };

    expect(mapSite(empty, NOW)).toMatchObject({ servesMenu: false, servesBakery: false });
  });
});

describe('formatOpening', () => {
  it('reads as a month and year', () => {
    expect(formatOpening(new Date('2026-09-01T00:00:00.000Z'))).toBe('Sep 2026');
  });
});
