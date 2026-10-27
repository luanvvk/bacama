jest.mock('@/lib/prisma', () => ({
  prisma: {
    bakeryItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import type { BakeryItemValues } from '@/lib/schemas/bakery-item';

import {
  createBakeryItem,
  deactivateBakeryItem,
  getAdminBakeryItems,
  slugify,
  updateBakeryItem,
} from '../bakery-item-admin';

const db = prisma.bakeryItem as unknown as Record<'findMany' | 'create' | 'update', jest.Mock>;

const VALUES: BakeryItemValues = {
  siteId: 'site-1',
  nameVi: 'Bánh mì bơ tỏi',
  nameEn: 'Garlic Butter Roll',
  descriptionVi: 'mô tả',
  descriptionEn: 'desc',
  priceVnd: 45000,
  bakesAt: 'Hằng ngày',
  sellOutBy: null,
  handoff: 'pickup',
  handoffUrl: null,
  isActive: true,
};

afterEach(() => jest.resetAllMocks());

describe('slugify', () => {
  it('lowercases, strips diacritics and collapses punctuation', () => {
    expect(slugify('  Đào Crème Brûlée! ')).toBe('dao-creme-brulee');
  });
});

describe('createBakeryItem', () => {
  it('derives the slug from the English name', async () => {
    db.findMany.mockResolvedValue([]);

    await createBakeryItem(VALUES);

    expect(db.create).toHaveBeenCalledWith({
      data: { ...VALUES, slug: 'garlic-butter-roll' },
    });
  });

  it('suffixes the slug when it already exists at that site', async () => {
    db.findMany.mockResolvedValue([
      { slug: 'garlic-butter-roll' },
      { slug: 'garlic-butter-roll-2' },
      { slug: 'garlic-butter-rolls' },
    ]);

    await createBakeryItem(VALUES);

    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ siteId: 'site-1' }) }),
    );
    expect(db.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'garlic-butter-roll-3' }),
    });
  });
});

describe('updateBakeryItem', () => {
  it('never writes siteId or slug', async () => {
    await updateBakeryItem('item-1', VALUES);

    const { siteId: _siteId, ...rest } = VALUES;
    expect(db.update).toHaveBeenCalledWith({ where: { id: 'item-1' }, data: rest });
  });
});

describe('deactivateBakeryItem', () => {
  it('sets isActive to false instead of deleting', async () => {
    await deactivateBakeryItem('item-1');

    expect(db.update).toHaveBeenCalledWith({ where: { id: 'item-1' }, data: { isActive: false } });
  });
});

describe('getAdminBakeryItems', () => {
  it('pages with a cursor and reports the next one', async () => {
    db.findMany.mockResolvedValue([
      { ...VALUES, id: 'i1', slug: 'a', site: { nameEn: 'S' } },
      { ...VALUES, id: 'i2', slug: 'b', site: { nameEn: 'S' } },
    ]);

    const result = await getAdminBakeryItems({}, { take: 1, cursor: 'i0' });

    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 2, cursor: { id: 'i0' }, skip: 1 }),
    );
    expect(result.items.map((item) => item.id)).toEqual(['i1']);
    expect(result.nextCursor).toBe('i1');
  });

  it('applies the site scope and flattens the site name', async () => {
    db.findMany.mockResolvedValue([
      { ...VALUES, id: 'i1', slug: 's', site: { nameEn: 'Site One' } },
    ]);

    const result = await getAdminBakeryItems({ siteId: 'site-1' });

    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { siteId: 'site-1' } }),
    );
    expect(result.nextCursor).toBeNull();
    expect(result.items[0]).toMatchObject({
      id: 'i1',
      siteName: 'Site One',
      nameEn: 'Garlic Butter Roll',
    });
  });
});
