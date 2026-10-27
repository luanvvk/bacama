import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AdminStaffMember } from '@/services/users/get-admin-staff';

import { StaffDirectory } from '../index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
}));

const person = (overrides: Partial<AdminStaffMember>): AdminStaffMember => ({
  id: 'u1',
  name: 'Hang',
  email: 'hang@example.com',
  role: 'admin',
  homeSiteName: null,
  ...overrides,
});

describe('StaffDirectory', () => {
  it('computes the header counts from the rows and shows the Clerk roles note', () => {
    render(
      <StaffDirectory
        nextCursor={null}
        staff={[
          person({}),
          person({ id: 'u2', name: 'Mai', role: 'staff', homeSiteName: 'Da Nang' }),
        ]}
      />,
    );

    expect(screen.getByText(/"count":2,"admins":1/)).toBeInTheDocument();
    expect(screen.getByText('rolesNote')).toBeInTheDocument();
    expect(screen.getByText('Da Nang')).toBeInTheDocument();
  });

  it('filters by name, email or site and shows an empty state', async () => {
    render(
      <StaffDirectory
        nextCursor={null}
        staff={[
          person({}),
          person({ id: 'u2', name: 'Mai', role: 'staff', homeSiteName: 'Da Nang' }),
        ]}
      />,
    );
    const search = screen.getByRole('textbox', { name: 'searchLabel' });

    await userEvent.type(search, 'da nang');
    expect(screen.queryByText('Hang')).not.toBeInTheDocument();
    expect(screen.getByText('Mai')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('appends the next page and hides Load more on the last page', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [person({ id: 'u9', name: 'Late Arrival' })], nextCursor: null }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<StaffDirectory staff={[person({})]} nextCursor="u1" />);

    await userEvent.click(screen.getByRole('button', { name: 'loadMore' }));

    expect(await screen.findByText('Late Arrival')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/staff?cursor=u1');
    expect(screen.queryByRole('button', { name: 'loadMore' })).not.toBeInTheDocument();
  });

  it('hides Load more when there is no next page', () => {
    render(<StaffDirectory staff={[person({})]} nextCursor={null} />);

    expect(screen.queryByRole('button', { name: 'loadMore' })).not.toBeInTheDocument();
  });
});
