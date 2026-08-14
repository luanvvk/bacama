import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { ControlledInput } from '../index';

interface FormValues {
  email: string;
}

const Harness = ({ onSubmit }: { onSubmit: (values: FormValues) => void }) => {
  const { control, handleSubmit } = useForm<FormValues>({ defaultValues: { email: '' } });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ControlledInput control={control} name="email" label="Email" />
      <button type="submit">Submit</button>
    </form>
  );
};

describe('ControlledInput', () => {
  it('renders an input associated with its label', () => {
    render(<Harness onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('submits the typed value', async () => {
    const onSubmit = jest.fn();
    render(<Harness onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com' }, expect.anything());
  });
});
