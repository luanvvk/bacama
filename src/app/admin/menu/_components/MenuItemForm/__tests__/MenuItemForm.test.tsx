import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MenuItemForm } from '../index';

const refresh = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
jest.mock('@/lib/toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) =>
    namespace === 'Menu.sections' ? `section:${key}` : key,
}));

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockResolvedValue({ ok: true, status: 201 });
  global.fetch = fetchMock;
});

afterEach(() => jest.clearAllMocks());

describe('MenuItemForm', () => {
  it('shows validation errors and does not submit an empty form', async () => {
    const user = userEvent.setup();
    render(<MenuItemForm defaultSiteId="s1" onDone={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(await screen.findAllByText('validation.required')).toHaveLength(3);
    expect(screen.getByText('validation.price')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts a payload without a slug', async () => {
    const user = userEvent.setup();
    const onDone = jest.fn();
    render(<MenuItemForm defaultSiteId="s1" onDone={onDone} />);

    await user.click(screen.getByRole('combobox', { name: 'fields.section' }));
    await user.click(await screen.findByRole('option', { name: 'section:tea' }));
    await user.type(screen.getByLabelText('fields.nameVi'), 'Trà');
    await user.type(screen.getByLabelText('fields.nameEn'), 'Tea');
    await user.type(screen.getByLabelText('fields.priceVnd'), '45000');
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/admin/menu-items');
    expect(JSON.parse(init.body)).toEqual({
      siteId: 's1',
      section: 'tea',
      nameVi: 'Trà',
      nameEn: 'Tea',
      priceVnd: 45000,
      imageUrl: null,
      descriptionVi: null,
      descriptionEn: null,
      order: 0,
    });
    expect(refresh).toHaveBeenCalled();
  });

  it('rejects a non-https image url', async () => {
    const user = userEvent.setup();
    render(<MenuItemForm defaultSiteId="s1" onDone={jest.fn()} />);

    await user.type(screen.getByLabelText('fields.imageUrl'), 'https://example.com/a.jpg');
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(await screen.findByText('validation.https')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
