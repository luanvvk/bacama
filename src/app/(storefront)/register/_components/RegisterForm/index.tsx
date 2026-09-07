'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs/legacy';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ControlledInput } from '@/components/form/ControlledInput';
import { FormField } from '@/components/form/FormField';
import { AuthCard } from '@/components/auth/AuthCard';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';

import { registerSchema, type RegisterFormValues } from './schema';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Registration failed.';

export const RegisterForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = async ({ fullName, email, password }: RegisterFormValues) => {
    if (!isLoaded) return;

    setError(null);

    try {
      if (verificationPending) {
        const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
        if (result.status === 'complete') await setActive({ session: result.createdSessionId });
        return;
      }

      const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/);
      await signUp.create({
        firstName,
        lastName: lastNameParts.join(' ') || undefined,
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerificationPending(true);
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
    }
  };

  const onGoogleClick = () => {
    if (!isLoaded) return;
    void signUp.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/me',
    });
  };

  return (
    <AuthCard
      title={verificationPending ? 'Verify your email' : 'Create your account'}
      description={
        verificationPending
          ? 'Enter the code we sent to your email.'
          : 'Save your progress, track orders, and enrol in courses.'
      }
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {!verificationPending && <SocialAuthButton onGoogleClick={onGoogleClick} />}

      {!verificationPending && (
        <div className="flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            or
          </span>
          <div className="bg-border h-px flex-1" />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {!verificationPending && (
          <ControlledInput control={control} name="fullName" label="Full name" />
        )}
        {!verificationPending && (
          <ControlledInput control={control} name="email" type="email" label="Email" />
        )}
        {!verificationPending && (
          <ControlledInput control={control} name="password" type="password" label="Password" />
        )}
        {verificationPending && (
          <FormField id="verification-code" label="Verification code">
            <Input
              id="verification-code"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
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
          {verificationPending ? 'Verify email' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  );
};
