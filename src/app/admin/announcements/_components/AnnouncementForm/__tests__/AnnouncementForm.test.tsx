import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AnnouncementForm } from '../index';

const refresh = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
jest.mock('@/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockResolvedValue({ ok: true, status: 201 });
  global.fetch = fetchMock;
});

afterEach(() => jest.clearAllMocks());

const fill = async (user: ReturnType<typeof userEvent.setup>, endsAt?: string) => {
  await user.type(screen.getByLabelText('fields.titleVi'), 'Tiêu đề');
  await user.type(screen.getByLabelText('fields.titleEn'), 'Title');
  await user.type(screen.getByLabelText('fields.bodyVi'), 'Nội dung');
  await user.type(screen.getByLabelText('fields.bodyEn'), 'Body');
  await user.type(screen.getByLabelText('fields.startsAt'), '2026-11-01T09:00');
  if (endsAt) await user.type(screen.getByLabelText('fields.endsAt'), endsAt);
};

describe('AnnouncementForm', () => {
  it('shows required errors and does not submit an empty form', async () => {
    const user = userEvent.setup();
    render(<AnnouncementForm defaultSiteId="s1" onDone={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(await screen.findAllByText('validation.required')).toHaveLength(5);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an end before the start', async () => {
    const user = userEvent.setup();
    render(<AnnouncementForm defaultSiteId="s1" onDone={jest.fn()} />);

    await fill(user, '2026-10-31T09:00');
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(await screen.findByText('validation.endsAfterStart')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('hides the site picker when no site options are given (staff)', () => {
    render(<AnnouncementForm defaultSiteId="s1" onDone={jest.fn()} />);

    expect(screen.queryByRole('combobox', { name: 'fields.siteId' })).not.toBeInTheDocument();
  });

  it('shows the site picker when site options are given (admin)', () => {
    render(
      <AnnouncementForm
        defaultSiteId="all"
        siteOptions={[
          { value: 'all', label: 'allSites' },
          { value: 's1', label: 'Hanoi' },
        ]}
        onDone={jest.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'fields.siteId' })).toBeInTheDocument();
  });

  it('posts Vietnam-offset ISO dates and a null siteId for all sites', async () => {
    const user = userEvent.setup();
    const onDone = jest.fn();
    render(
      <AnnouncementForm
        defaultSiteId="all"
        siteOptions={[
          { value: 'all', label: 'allSites' },
          { value: 's1', label: 'Hanoi' },
        ]}
        onDone={onDone}
      />,
    );

    await fill(user, '2026-11-05T18:30');
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/admin/announcements');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      siteId: null,
      titleVi: 'Tiêu đề',
      titleEn: 'Title',
      bodyVi: 'Nội dung',
      bodyEn: 'Body',
      startsAt: '2026-11-01T09:00:00+07:00',
      endsAt: '2026-11-05T18:30:00+07:00',
      isActive: true,
    });
    expect(refresh).toHaveBeenCalled();
  });
});
