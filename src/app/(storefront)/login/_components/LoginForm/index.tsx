'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs/legacy';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ControlledInput } from '@/components/form/ControlledInput';
import { FormField } from '@/components/form/FormField';
import { AuthCard } from '@/components/auth/AuthCard';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';

import { loginSchema, type LoginFormValues } from './schema';

type LoginMode = 'credentials' | 'second-factor' | 'forgot' | 'reset-code' | 'reset-password';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Authentication failed.';

export const LoginForm = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [mode, setMode] = useState<LoginMode>('credentials');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const formSchema =
    mode === 'credentials'
      ? loginSchema
      : mode === 'forgot'
        ? z.object({ email: z.string().email('Enter a valid email address'), password: z.string() })
        : z.object({ email: z.string(), password: z.string() });
  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    if (!isLoaded) return;

    setError(null);

    try {
      if (mode === 'forgot') {
        await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
        setMode('reset-code');
        return;
      }

      if (mode === 'reset-code') {
        await signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code });
        setMode('reset-password');
        return;
      }

      if (mode === 'reset-password') {
        const result = await signIn.resetPassword({ password, signOutOfOtherSessions: true });
        if (result.status === 'complete') await setActive({ session: result.createdSessionId });
        return;
      }

      if (mode === 'second-factor') {
        const result = await signIn.attemptSecondFactor({ strategy: 'totp', code });
        if (result.status === 'complete') await setActive({ session: result.createdSessionId });
        return;
      }

      const result = await signIn.create({ strategy: 'password', identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else if (result.status === 'needs_second_factor') {
        setMode('second-factor');
      }
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
    }
  };

  const onGoogleClick = () => {
    if (!isLoaded) return;
    void signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/me',
    });
  };

  const isCredentials = mode === 'credentials';
  const isReset = mode === 'forgot' || mode === 'reset-code' || mode === 'reset-password';
  const title =
    mode === 'second-factor'
      ? 'Verify your identity'
      : isReset
        ? 'Reset your password'
        : 'Welcome back';
  const description =
    mode === 'second-factor'
      ? 'Enter the code from your authenticator app.'
      : mode === 'forgot'
        ? 'We will send a reset code to your email.'
        : mode === 'reset-code'
          ? 'Enter the code we sent to your email.'
          : mode === 'reset-password'
            ? 'Choose a new password for your account.'
            : 'Log in to see your orders and courses.';

  return (
    <AuthCard
      title={title}
      description={description}
      footer={
        <>
          Don&rsquo;t have an account?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {isCredentials && <SocialAuthButton onGoogleClick={onGoogleClick} />}

      {isCredentials && (
        <div className="flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            or
          </span>
          <div className="bg-border h-px flex-1" />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {(isCredentials || mode === 'forgot') && (
          <ControlledInput control={control} name="email" type="email" label="Email" />
        )}
        {(isCredentials || mode === 'reset-password') && (
          <ControlledInput
            control={control}
            name="password"
            type="password"
            label={mode === 'reset-password' ? 'New password' : 'Password'}
          />
        )}
        {(mode === 'second-factor' || mode === 'reset-code') && (
          <FormField id="verification-code" label="Verification code">
            <Input
              id="verification-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </FormField>
        )}
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={formState.isSubmitting || !isLoaded}>
          {mode === 'forgot'
            ? 'Send reset code'
            : mode === 'reset-code'
              ? 'Verify code'
              : mode === 'reset-password'
                ? 'Set new password'
                : mode === 'second-factor'
                  ? 'Verify'
                  : 'Log in'}
        </Button>
      </form>

      {isCredentials && (
        <button
          type="button"
          className="text-primary text-sm hover:underline"
          onClick={() => setMode('forgot')}
        >
          Forgot your password?
        </button>
      )}
      {!isCredentials && (
        <button
          type="button"
          className="text-primary text-sm hover:underline"
          onClick={() => setMode('credentials')}
        >
          Back to log in
        </button>
      )}
    </AuthCard>
  );
};
