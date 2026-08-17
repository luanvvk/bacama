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
