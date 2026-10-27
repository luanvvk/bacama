import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AdminAnnouncement } from '@/services/sites/get-admin-announcements';

import { AnnouncementsManager } from '../index';

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
jest.mock('@/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(Date.now() - days * DAY);

const announcement = (overrides: Partial<AdminAnnouncement>): AdminAnnouncement => ({
  id: 'a1',
  siteId: 's1',
  siteName: 'Hanoi',
  titleVi: 'Tiêu đề',
  titleEn: 'Title',
  bodyVi: 'Nội dung',
  bodyEn: 'Body',
  startsAt: ago(1),
  endsAt: null,
  isActive: true,
  ...overrides,
});

const rowFor = (title: string) => screen.getByRole('row', { name: new RegExp(title) });

describe('AnnouncementsManager', () => {
  it('badges each announcement with its derived status', () => {
    render(
      <AnnouncementsManager
        nextCursor={null}
        announcements={[
          announcement({ id: '1', titleEn: 'LiveOne' }),
          announcement({ id: '2', titleEn: 'SoonOne', startsAt: ago(-2) }),
          announcement({ id: '3', titleEn: 'OldOne', startsAt: ago(5), endsAt: ago(2) }),
          announcement({ id: '4', titleEn: 'DraftOne', isActive: false }),
        ]}
        defaultSiteId="s1"
        canManageAllSites={false}
      />,
    );

    expect(within(rowFor('LiveOne')).getByText('statuses.live')).toBeInTheDocument();
    expect(within(rowFor('SoonOne')).getByText('statuses.scheduled')).toBeInTheDocument();
    expect(within(rowFor('OldOne')).getByText('statuses.expired')).toBeInTheDocument();
    expect(within(rowFor('DraftOne')).getByText('statuses.draft')).toBeInTheDocument();
  });

  it('hides edit and delete on all-sites rows for staff', () => {
    render(
      <AnnouncementsManager
        nextCursor={null}
        announcements={[
          announcement({ id: '1', titleEn: 'Global', siteId: null, siteName: null }),
          announcement({ id: '2', titleEn: 'Local' }),
        ]}
        defaultSiteId="s1"
        canManageAllSites={false}
      />,
    );

    expect(within(rowFor('Global')).queryByRole('button', { name: 'edit' })).toBeNull();
    expect(within(rowFor('Global')).queryByRole('button', { name: 'delete' })).toBeNull();
    expect(within(rowFor('Local')).getByRole('button', { name: 'edit' })).toBeInTheDocument();
    expect(within(rowFor('Local')).getByRole('button', { name: 'delete' })).toBeInTheDocument();
  });

  it('lets admin edit and delete all-sites rows', () => {
    render(
      <AnnouncementsManager
        nextCursor={null}
        announcements={[announcement({ id: '1', titleEn: 'Global', siteId: null, siteName: null })]}
        siteOptions={[{ value: 's1', label: 'Hanoi' }]}
        defaultSiteId={null}
        canManageAllSites
      />,
    );

    expect(within(rowFor('Global')).getByRole('button', { name: 'edit' })).toBeInTheDocument();
    expect(within(rowFor('Global')).getByRole('button', { name: 'delete' })).toBeInTheDocument();
  });

  it('offers an all-sites choice in the create form for admin', async () => {
    const user = userEvent.setup();
    render(
      <AnnouncementsManager
        nextCursor={null}
        announcements={[]}
        siteOptions={[{ value: 's1', label: 'Hanoi' }]}
        defaultSiteId={null}
        canManageAllSites
      />,
    );

    await user.click(screen.getByRole('button', { name: 'new' }));
    await user.click(screen.getByRole('combobox', { name: 'fields.siteId' }));

    expect(await screen.findByRole('option', { name: 'allSites' })).toBeInTheDocument();
  });

  it('shows no site picker in the create form for staff', async () => {
    const user = userEvent.setup();
    render(
      <AnnouncementsManager
        announcements={[]}
        nextCursor={null}
        defaultSiteId="s1"
        canManageAllSites={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'new' }));

    expect(screen.getByLabelText('fields.titleEn')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'fields.siteId' })).not.toBeInTheDocument();
  });

  it('appends the next page and hides Load more on the last page', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [announcement({ id: '9', titleEn: 'LateOne' })],
        nextCursor: null,
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    render(
      <AnnouncementsManager
        announcements={[announcement({ titleEn: 'FirstOne' })]}
        nextCursor="a1"
        defaultSiteId="s1"
        canManageAllSites={false}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'loadMore' }));

    expect(await screen.findByText('LateOne')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/announcements?cursor=a1');
    expect(screen.getByText('FirstOne')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'loadMore' })).not.toBeInTheDocument();
  });
});
