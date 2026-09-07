import { requireUser } from '@/lib/auth/guards';

const AccountLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireUser();

  return children;
};

export default AccountLayout;
