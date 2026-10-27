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
});
