import { render, screen } from '@testing-library/react';

import type { AdminAnnouncement } from '@/services/sites/get-admin-announcements';

import { AnnouncementsPanel } from '../index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const announcement = (overrides: Partial<AdminAnnouncement>): AdminAnnouncement => ({
  id: 'a1',
  siteId: 's1',
  siteName: 'Hanoi',
  titleVi: 'Tiêu đề',
  titleEn: 'Title',
  bodyVi: 'Nội dung',
  bodyEn: 'Body',
  startsAt: new Date(Date.now() - 86_400_000),
  endsAt: null,
  isActive: true,
  ...overrides,
});

describe('AnnouncementsPanel', () => {
  it('renders the passed announcements with status and scope', () => {
    render(
      <AnnouncementsPanel
        announcements={[
          announcement({ id: '1', titleEn: 'First', bodyEn: 'First body' }),
          announcement({
            id: '2',
            titleEn: 'Second',
            siteId: null,
            siteName: null,
            isActive: false,
          }),
        ]}
      />,
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('First body')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('statuses.live')).toBeInTheDocument();
    expect(screen.getByText('statuses.draft')).toBeInTheDocument();
    expect(screen.getByText(/allSites/)).toBeInTheDocument();
  });

  it('shows the empty message when there are none', () => {
    render(<AnnouncementsPanel announcements={[]} />);

    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('links to the announcements admin page', () => {
    render(<AnnouncementsPanel announcements={[]} />);

    expect(screen.getByRole('link', { name: /new/ })).toHaveAttribute(
      'href',
      '/admin/announcements',
    );
  });
});
