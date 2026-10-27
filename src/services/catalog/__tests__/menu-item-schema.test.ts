import { createMenuItemSchema, updateMenuItemSchema } from '../menu-item-schema';

const base = { siteId: 's1', section: 'tea', nameVi: 'Trà', nameEn: 'Tea', priceVnd: 40000 };

describe('menu item image and description validation', () => {
  it('accepts an https image and descriptions, or none at all', () => {
    expect(createMenuItemSchema.safeParse(base).success).toBe(true);
    expect(
      createMenuItemSchema.safeParse({
        ...base,
        imageUrl: 'https://images.unsplash.com/photo-1',
        descriptionVi: 'Trà mát',
        descriptionEn: 'Iced tea',
      }).success,
    ).toBe(true);
  });

  it.each([
    'http://images.unsplash.com/a.jpg',
    'https://example.com/a.jpg',
    'javascript:alert(1)',
    'not a url',
  ])('rejects image url %s', (imageUrl) => {
    expect(createMenuItemSchema.safeParse({ ...base, imageUrl }).success).toBe(false);
    expect(updateMenuItemSchema.safeParse({ imageUrl }).success).toBe(false);
  });

  it('rejects descriptions over 160 characters and lets updates clear fields with null', () => {
    expect(
      createMenuItemSchema.safeParse({ ...base, descriptionEn: 'x'.repeat(161) }).success,
    ).toBe(false);
    expect(updateMenuItemSchema.safeParse({ imageUrl: null, descriptionEn: null }).success).toBe(
      true,
    );
  });
});
