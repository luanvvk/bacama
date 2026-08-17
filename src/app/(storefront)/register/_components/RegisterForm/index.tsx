'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { ControlledInput } from '@/components/form/ControlledInput';
import { AuthCard } from '@/components/auth/AuthCard';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';

import { registerSchema, type RegisterFormValues } from './schema';

export const RegisterForm = () => {
  const { control, handleSubmit, formState } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = () => toast("Sign-up isn't wired up yet — this is UI only for now.");

  return (
    <AuthCard
      title="Create your account"
      description="Save your progress, track orders, and enrol in courses."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SocialAuthButton />

      <div className="flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          or
        </span>
        <div className="bg-border h-px flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <ControlledInput control={control} name="fullName" label="Full name" />
        <ControlledInput control={control} name="email" type="email" label="Email" />
        <ControlledInput control={control} name="password" type="password" label="Password" />
        <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
};
