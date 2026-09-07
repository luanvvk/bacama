import { ClerkLoaded, ClerkLoading, UserProfile } from '@clerk/nextjs';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';

const clerkAppearance = {
  variables: {
    colorPrimary: 'var(--primary)',
    colorBackground: 'var(--card)',
    colorInputBackground: 'var(--background)',
    colorText: 'var(--foreground)',
    colorTextSecondary: 'var(--muted-foreground)',
    colorNeutral: 'var(--border)',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-sans)',
    fontFamilyButtons: 'var(--font-sans)',
  },
  elements: {
    rootBox: 'w-full',
    card: 'w-full max-w-4xl rounded-lg border border-border bg-card shadow-brand',
    navbar: 'border-border bg-background',
    navbarButton: 'font-mono text-xs tracking-widest uppercase',
    headerTitle: 'font-heading text-2xl font-normal',
    headerSubtitle: 'text-muted-foreground',
    profileSectionTitle: 'font-heading font-normal',
    formFieldLabel: 'font-mono text-xs tracking-widest uppercase',
    formFieldInput: 'rounded-lg border-input bg-background',
    formButtonPrimary:
      'rounded-lg bg-primary font-mono text-xs tracking-widest uppercase text-primary-foreground hover:bg-foreground',
    footerActionLink: 'text-primary hover:text-foreground',
    dividerLine: 'bg-border',
  },
};

const ProfilePage = () => (
  <>
    <main>
      <Container>
        <Breadcrumb className="pt-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="auth-surface-enter py-10">
          <ClerkLoading>
            <div
              className="border-border bg-card shadow-brand flex min-h-96 w-full animate-pulse overflow-hidden rounded-lg border"
              aria-label="Loading profile"
            >
              <div className="border-border bg-background hidden w-56 border-r p-5 sm:block">
                <div className="bg-muted h-3 w-24 rounded" />
                <div className="bg-muted mt-6 h-8 w-full rounded" />
                <div className="bg-muted mt-3 h-8 w-full rounded" />
                <div className="bg-muted mt-3 h-8 w-4/5 rounded" />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
                <div className="bg-muted h-6 w-40 rounded" />
                <div className="bg-muted h-3 w-64 rounded" />
                <div className="bg-muted mt-6 h-10 w-full rounded" />
                <div className="bg-muted h-10 w-full rounded" />
                <div className="bg-muted h-9 w-28 rounded" />
              </div>
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <UserProfile routing="path" path="/account/profile" appearance={clerkAppearance} />
          </ClerkLoaded>
        </div>
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default ProfilePage;
