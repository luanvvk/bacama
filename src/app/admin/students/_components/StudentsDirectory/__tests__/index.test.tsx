import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AdminStudent } from '@/services/enrollments/get-admin-students';

import { StudentsDirectory } from '../index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
}));

const student = (overrides: Partial<AdminStudent>): AdminStudent => ({
  enrollmentId: 'e1',
  name: 'Ngoc Le',
  email: 'ngoc@example.com',
  courseTitle: 'Latte art',
  progressPercent: 33,
  status: 'active',
  ...overrides,
});

describe('StudentsDirectory', () => {
  it('renders one row per enrolment with progress', () => {
    render(
      <StudentsDirectory
        students={[
          student({}),
          student({ enrollmentId: 'e2', courseTitle: 'Viennoiserie', progressPercent: 0 }),
        ]}
        total={2}
      />,
    );

    expect(screen.getAllByText('Ngoc Le')).toHaveLength(2);
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.queryByText(/truncated/)).not.toBeInTheDocument();
  });

  it('filters by name, email or course', async () => {
    render(
      <StudentsDirectory
        students={[
          student({}),
          student({
            enrollmentId: 'e2',
            name: 'Khoi Tran',
            email: 'k@example.com',
            courseTitle: 'Barista',
          }),
        ]}
        total={2}
      />,
    );

    await userEvent.type(screen.getByRole('textbox', { name: 'searchLabel' }), 'barista');

    expect(screen.queryByText('Ngoc Le')).not.toBeInTheDocument();
    expect(screen.getByText('Khoi Tran')).toBeInTheDocument();
  });

  it('shows the empty state when nothing matches', async () => {
    render(<StudentsDirectory students={[student({})]} total={1} />);

    await userEvent.type(screen.getByRole('textbox', { name: 'searchLabel' }), 'zzz');

    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('notes truncation when there are more enrolments than rows', () => {
    render(<StudentsDirectory students={[student({})]} total={350} />);

    expect(screen.getByText(/truncated/)).toBeInTheDocument();
  });
});
