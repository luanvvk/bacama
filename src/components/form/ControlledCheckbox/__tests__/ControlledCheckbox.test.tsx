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
