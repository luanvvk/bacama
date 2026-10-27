import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AdminSite } from '@/services/sites/site-admin';

import { SitesGrid } from '../index';

jest.mock('@/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

const site = (overrides: Partial<AdminSite>): AdminSite => ({
  id: 'site-1',
  slug: 'ngo-quyen',
  nameVi: 'Ngô Quyền',
  nameEn: 'Ngo Quyen',
  addressVi: '27 Ngô Quyền',
  addressEn: '27 Ngo Quyen',
  hoursVi: 'Hằng ngày',
  hoursEn: 'Every day',
  isActive: true,
  todaysRoastProductId: null,
  ...overrides,
});

describe('SitesGrid', () => {
  it('appends the next page and hides Load more on the last page', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [site({ id: 'site-2', slug: 'hoi-an', nameEn: 'Hoi An' })],
        nextCursor: null,
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<SitesGrid sites={[site({})]} nextCursor="site-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'loadMore' }));

    expect(await screen.findByText('Hoi An')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/sites?cursor=site-1');
    expect(screen.queryByRole('button', { name: 'loadMore' })).not.toBeInTheDocument();
  });

  it('hides Load more when there is no next page', () => {
    render(<SitesGrid sites={[site({})]} nextCursor={null} />);

    expect(screen.queryByRole('button', { name: 'loadMore' })).not.toBeInTheDocument();
  });
});
