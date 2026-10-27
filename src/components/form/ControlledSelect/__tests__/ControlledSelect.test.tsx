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

describe('ControlledSelect required, ref and error announcement', () => {
  const RequiredHarness = () => {
    const { control, setError, setFocus } = useForm<{ field: string }>({
      defaultValues: { field: '' },
    });
    return (
      <form>
        <ControlledSelect
          control={control}
          name="field"
          label="Field"
          required
          options={[{ label: 'A', value: 'a' }]}
        />
        <button type="button" onClick={() => setError('field', { message: 'Bad field' })}>
          Fail
        </button>
        <button type="button" onClick={() => setFocus('field')}>
          Focus
        </button>
      </form>
    );
  };

  it('marks the field required, forwards the ref and announces errors', async () => {
    render(<RequiredHarness />);
    const field = screen.getByRole('combobox');
    expect(field).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('*')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Focus' }));
    expect(field).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Fail' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Bad field');
  });
});
