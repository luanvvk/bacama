import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { BakeryItemFormInput } from '@/lib/schemas/bakery-item';

import { BakeryItemForm } from '../BakeryItemForm';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const DEFAULTS: BakeryItemFormInput = {
  siteId: 'site-1',
  nameVi: '',
  nameEn: '',
  descriptionVi: '',
  descriptionEn: '',
  priceVnd: '',
  bakesAt: '',
  sellOutBy: '',
  handoff: 'pickup',
  handoffUrl: '',
  isActive: true,
};

const renderForm = (onSubmit = jest.fn().mockResolvedValue(undefined)) => {
  render(
    <BakeryItemForm
      defaultValues={DEFAULTS}
      sites={[{ id: 'site-1', name: 'Site One' }]}
      siteLocked
      submitLabel="create"
      onSubmit={onSubmit}
      onCancel={jest.fn()}
    />,
  );

  return onSubmit;
};

describe('BakeryItemForm', () => {
  it('shows validation messages and does not submit an empty form', async () => {
    const onSubmit = renderForm();

    await userEvent.click(screen.getByRole('button', { name: 'create' }));

    expect(await screen.findByText('Enter the English name.')).toBeInTheDocument();
    expect(screen.getByText('Enter the Vietnamese name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a price.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a non-https handoff link', async () => {
    const onSubmit = renderForm();

    await userEvent.type(screen.getByLabelText('handoffUrl'), 'http://example.com');
    await userEvent.click(screen.getByRole('button', { name: 'create' }));

    expect(await screen.findByText('Link must start with https://')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the parsed payload', async () => {
    const onSubmit = renderForm();

    await userEvent.type(screen.getByLabelText('nameVi'), 'Bánh');
    await userEvent.type(screen.getByLabelText('nameEn'), 'Roll');
    await userEvent.type(screen.getByLabelText('descriptionVi'), 'mô tả');
    await userEvent.type(screen.getByLabelText('descriptionEn'), 'desc');
    await userEvent.type(screen.getByLabelText('price'), '45000');
    await userEvent.type(screen.getByLabelText('bakesAt'), 'Daily');
    await userEvent.click(screen.getByRole('button', { name: 'create' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      siteId: 'site-1',
      nameVi: 'Bánh',
      nameEn: 'Roll',
      descriptionVi: 'mô tả',
      descriptionEn: 'desc',
      priceVnd: 45000,
      bakesAt: 'Daily',
      sellOutBy: null,
      handoff: 'pickup',
      handoffUrl: null,
      isActive: true,
    });
  });
});
