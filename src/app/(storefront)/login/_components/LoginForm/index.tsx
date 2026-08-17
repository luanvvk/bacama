'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { ControlledInput } from '@/components/form/ControlledInput';
import { AuthCard } from '@/components/auth/AuthCard';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';

import { loginSchema, type LoginFormValues } from './schema';

export const LoginForm = () => {
  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = () => toast("Sign-in isn't wired up yet — this is UI only for now.");

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to see your orders and courses."
      footer={
        <>
          Don&rsquo;t have an account?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create one
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
        <ControlledInput control={control} name="email" type="email" label="Email" />
        <ControlledInput control={control} name="password" type="password" label="Password" />
        <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
          Log in
        </Button>
      </form>
    </AuthCard>
  );
};
