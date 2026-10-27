import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AdminBakeryItem } from '@/services/catalog/bakery-item-admin';

import { BakeryItemsManager } from '../index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
jest.mock('@/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const item = (id: string, nameEn: string): AdminBakeryItem => ({
  id,
  slug: id,
  siteId: 'site-1',
  siteName: 'Site One',
  nameVi: `vi ${nameEn}`,
  nameEn,
  descriptionVi: '',
  descriptionEn: '',
  priceVnd: 45000,
  bakesAt: 'Daily',
  sellOutBy: null,
  handoff: 'pickup',
  handoffUrl: null,
  isActive: true,
});

const renderManager = (nextCursor: string | null) =>
  render(
    <BakeryItemsManager
      items={[item('b1', 'Garlic Roll')]}
      nextCursor={nextCursor}
      sites={[{ id: 'site-1', name: 'Site One' }]}
      lockedSiteId="site-1"
    />,
  );

describe('BakeryItemsManager load more', () => {
  it('hides Load more when there is no next page', () => {
    renderManager(null);

    expect(screen.queryByRole('button', { name: 'loadMore' })).not.toBeInTheDocument();
  });

  it('appends the next page and hides Load more on the last page', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [item('b2', 'Cheese Twist')], nextCursor: null }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    renderManager('b1');

    await userEvent.click(screen.getByRole('button', { name: 'loadMore' }));

    expect(await screen.findByText('Cheese Twist')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/bakery-items?cursor=b1');
    expect(screen.getByText('Garlic Roll')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'loadMore' })).not.toBeInTheDocument();
  });
});
