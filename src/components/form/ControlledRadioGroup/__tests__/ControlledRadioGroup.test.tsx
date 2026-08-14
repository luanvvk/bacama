import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { ControlledRadioGroup } from '../index';

interface FormValues {
  method: string;
}

const OPTIONS = [
  {
    value: 'zalopay',
    label: 'ZaloPay',
    description: 'Open ZaloPay, confirm, done',
    meta: 'Popular',
  },
  { value: 'cod', label: 'Cash on delivery', description: 'Pay the courier on arrival' },
];

const Harness = ({ onSubmit }: { onSubmit: (values: FormValues) => void }) => {
  const { control, handleSubmit } = useForm<FormValues>({ defaultValues: { method: 'zalopay' } });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ControlledRadioGroup
        control={control}
        name="method"
        label="Payment method"
        options={OPTIONS}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

describe('ControlledRadioGroup', () => {
  it('submits the default option unchanged', async () => {
    const onSubmit = jest.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ method: 'zalopay' }, expect.anything());
  });

  it('submits the newly selected option', async () => {
    const onSubmit = jest.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('radio', { name: /Cash on delivery/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ method: 'cod' }, expect.anything());
  });
});
