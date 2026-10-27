import { auth, currentUser } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';

import { getClerkAuthProvider } from '../clerk';

jest.mock('react', () => ({ ...jest.requireActual('react'), cache: <T>(fn: T) => fn }));
jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn(), currentUser: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn(), upsert: jest.fn() } },
}));

const findUnique = prisma.user.findUnique as jest.Mock;
const upsert = prisma.user.upsert as jest.Mock;

const row = {
  id: 'u1',
  clerkId: 'clerk_1',
  email: 'a@b.com',
  name: 'An Nguyen',
  role: 'customer',
  preferredLocale: 'vi',
  homeSiteId: null,
};

const clerkUser = {
  firstName: 'An',
  lastName: 'Nguyen',
  primaryEmailAddress: { emailAddress: 'a@b.com' },
  publicMetadata: { role: 'admin' },
};

describe('clerk getCurrentUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_1' });
    (currentUser as jest.Mock).mockResolvedValue(clerkUser);
  });

  const getUser = () => getClerkAuthProvider().getCurrentUser();

  it('returns null when signed out', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

    expect(await getUser()).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('returns the existing row without creating one', async () => {
    findUnique.mockResolvedValue(row);

    expect(await getUser()).toMatchObject({ id: 'u1', role: 'customer' });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('creates a missing row as a customer, ignoring Clerk metadata', async () => {
    findUnique.mockResolvedValue(null);
    upsert.mockResolvedValue(row);

    expect(await getUser()).toMatchObject({ id: 'u1' });
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith({
      where: { clerkId: 'clerk_1' },
      create: {
        clerkId: 'clerk_1',
        email: 'a@b.com',
        name: 'An Nguyen',
        role: 'customer',
        preferredLocale: 'vi',
      },
      update: {},
    });
  });

  it('re-reads the row when a concurrent request created it (P2002)', async () => {
    findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(row);
    upsert.mockRejectedValue(
      Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }),
    );

    expect(await getUser()).toMatchObject({ id: 'u1' });
  });

  it('returns null when Clerk has no email to create from', async () => {
    findUnique.mockResolvedValue(null);
    (currentUser as jest.Mock).mockResolvedValue({ ...clerkUser, primaryEmailAddress: null });

    expect(await getUser()).toBeNull();
    expect(upsert).not.toHaveBeenCalled();
  });
});
