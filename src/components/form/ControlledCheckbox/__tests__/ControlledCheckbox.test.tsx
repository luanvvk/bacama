import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { ControlledCheckbox } from '../index';

interface FormValues {
  subscribe: boolean;
}

const Harness = ({ onSubmit }: { onSubmit: (values: FormValues) => void }) => {
  const { control, handleSubmit } = useForm<FormValues>({ defaultValues: { subscribe: false } });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ControlledCheckbox control={control} name="subscribe" label="Subscribe to newsletter" />
      <button type="submit">Submit</button>
    </form>
  );
};

describe('ControlledCheckbox', () => {
  it('toggles and submits the checked state', async () => {
    const onSubmit = jest.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Subscribe to newsletter' }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ subscribe: true }, expect.anything());
  });
});

describe('ControlledCheckbox required, ref and error announcement', () => {
  const RequiredHarness = () => {
    const { control, setError, setFocus } = useForm<{ field: boolean }>({
      defaultValues: { field: false },
    });
    return (
      <form>
        <ControlledCheckbox control={control} name="field" label="Field" required />
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
    const field = screen.getByRole('checkbox');
    expect(field).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('*')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Focus' }));
    expect(field).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Fail' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Bad field');
  });
});
