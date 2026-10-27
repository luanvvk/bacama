import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AdminSite } from '@/services/sites/site-admin';

import { SiteEditor } from '..';

const push = jest.fn();
const refresh = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));

const SITE: AdminSite = {
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
};

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockResolvedValue({ ok: true });
  global.fetch = fetchMock;
});

afterEach(() => jest.resetAllMocks());

describe('SiteEditor', () => {
  it('shows a validation message and does not submit an empty name', async () => {
    render(<SiteEditor site={SITE} products={[{ id: 'p1', name: 'Dalat' }]} />);

    await userEvent.clear(screen.getByLabelText('nameEn'));
    await userEvent.click(screen.getByRole('button', { name: 'save' }));

    expect(await screen.findByText('Enter the English name.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('patches the site with a null roast when none is chosen', async () => {
    render(<SiteEditor site={SITE} products={[{ id: 'p1', name: 'Dalat' }]} />);

    await userEvent.clear(screen.getByLabelText('hoursEn'));
    await userEvent.type(screen.getByLabelText('hoursEn'), '7am-9pm');
    await userEvent.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/admin/sites/site-1');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({
      nameVi: 'Ngô Quyền',
      nameEn: 'Ngo Quyen',
      addressVi: '27 Ngô Quyền',
      addressEn: '27 Ngo Quyen',
      hoursVi: 'Hằng ngày',
      hoursEn: '7am-9pm',
      isActive: true,
      todaysRoastProductId: null,
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/sites'));
  });
});
