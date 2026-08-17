import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { ControlledSelect } from '../index';

interface FormValues {
  sort: string;
}

const OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: low to high', value: 'price-asc' },
];

const Harness = ({ onSubmit }: { onSubmit: (values: FormValues) => void }) => {
  const { control, handleSubmit } = useForm<FormValues>({ defaultValues: { sort: 'newest' } });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ControlledSelect control={control} name="sort" label="Sort by" options={OPTIONS} />
      <button type="submit">Submit</button>
    </form>
  );
};

describe('ControlledSelect', () => {
  it('submits the selected option', async () => {
    const onSubmit = jest.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Price: low to high' }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ sort: 'price-asc' }, expect.anything());
  });
});
