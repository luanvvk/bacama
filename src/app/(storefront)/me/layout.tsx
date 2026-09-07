import { requireUser } from '@/lib/auth/guards';

const MeLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireUser();

  return children;
};

export default MeLayout;
