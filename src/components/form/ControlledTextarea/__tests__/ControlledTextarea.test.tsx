import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { ControlledTextarea } from '../index';

interface FormValues {
  notes: string;
}

const Harness = ({ onSubmit }: { onSubmit: (values: FormValues) => void }) => {
  const { control, handleSubmit } = useForm<FormValues>({ defaultValues: { notes: '' } });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ControlledTextarea control={control} name="notes" label="Notes" />
      <button type="submit">Submit</button>
    </form>
  );
};

describe('ControlledTextarea', () => {
  it('submits the typed value', async () => {
    const onSubmit = jest.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Notes'), 'Deliver after 5pm');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ notes: 'Deliver after 5pm' }, expect.anything());
  });
});

describe('ControlledTextarea required, ref and error announcement', () => {
  const RequiredHarness = () => {
    const { control, setError, setFocus } = useForm<{ field: string }>({
      defaultValues: { field: '' },
    });
    return (
      <form>
        <ControlledTextarea control={control} name="field" label="Field" required />
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
    const field = screen.getByRole('textbox');
    expect(field).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('*')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Focus' }));
    expect(field).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Fail' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Bad field');
  });
});
