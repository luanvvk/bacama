import { prisma } from '@/lib/prisma';

import { AnnouncementForbiddenError, AnnouncementNotFoundError } from '../announcement-errors';
import type { AnnouncementInput } from '../announcement-schema';
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from '../manage-announcements';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    announcement: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const { findUnique, create, update, delete: remove } = jest.mocked(prisma.announcement);

const staff = { id: 'u1', role: 'staff', homeSiteId: 'site-1' } as never;
const admin = { id: 'u2', role: 'admin', homeSiteId: null } as never;
const unassignedStaff = { id: 'u3', role: 'staff', homeSiteId: null } as never;

const input = (siteId: string | null): AnnouncementInput => ({
  siteId,
  titleVi: 'a',
  titleEn: 'a',
  bodyVi: 'b',
  bodyEn: 'b',
  startsAt: new Date('2026-06-01T00:00:00Z'),
  isActive: true,
});

const stored = (siteId: string | null) => findUnique.mockResolvedValue({ siteId } as never);

beforeEach(() => {
  create.mockResolvedValue({ id: 'a1' } as never);
  update.mockResolvedValue({ id: 'a1' } as never);
  remove.mockResolvedValue({ id: 'a1' } as never);
});
afterEach(() => jest.resetAllMocks());

const expectNoWrite = () => {
  expect(create).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
};

const forbidden = AnnouncementForbiddenError;
const notFound = AnnouncementNotFoundError;

describe('createAnnouncement', () => {
  it('lets staff create on their own site and defaults endsAt to null', async () => {
    await createAnnouncement(staff, input('site-1'));

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ siteId: 'site-1', endsAt: null }),
    });
  });

  it('rejects staff on another site before writing', async () => {
    await expect(createAnnouncement(staff, input('site-2'))).rejects.toBeInstanceOf(forbidden);
    expectNoWrite();
  });

  it('rejects staff creating an all-sites announcement', async () => {
    await expect(createAnnouncement(staff, input(null))).rejects.toBeInstanceOf(forbidden);
    expectNoWrite();
  });

  it('rejects staff without a home site', async () => {
    await expect(createAnnouncement(unassignedStaff, input('site-1'))).rejects.toBeInstanceOf(
      forbidden,
    );
    expectNoWrite();
  });

  it.each([null, 'site-9'])('lets admin create for %s', async (siteId) => {
    await createAnnouncement(admin, input(siteId));

    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe('updateAnnouncement', () => {
  it('lets staff update their own site', async () => {
    stored('site-1');

    await updateAnnouncement(staff, 'a1', input('site-1'));

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'a1' } }));
  });

  it('rejects staff when the stored row belongs to another site', async () => {
    stored('site-2');

    await expect(updateAnnouncement(staff, 'a1', input('site-1'))).rejects.toBeInstanceOf(
      forbidden,
    );
    expectNoWrite();
  });

  it('rejects staff editing an all-sites row', async () => {
    stored(null);

    await expect(updateAnnouncement(staff, 'a1', input(null))).rejects.toBeInstanceOf(forbidden);
    expectNoWrite();
  });

  it('rejects staff moving their row to all sites', async () => {
    stored('site-1');

    await expect(updateAnnouncement(staff, 'a1', input(null))).rejects.toBeInstanceOf(forbidden);
    expectNoWrite();
  });

  it('rejects staff moving their row to another site', async () => {
    stored('site-1');

    await expect(updateAnnouncement(staff, 'a1', input('site-2'))).rejects.toBeInstanceOf(
      forbidden,
    );
    expectNoWrite();
  });

  it('rejects staff without a home site', async () => {
    stored('site-1');

    await expect(updateAnnouncement(unassignedStaff, 'a1', input('site-1'))).rejects.toBeInstanceOf(
      forbidden,
    );
    expectNoWrite();
  });

  it('lets admin edit an all-sites row and repoint it', async () => {
    stored(null);

    await updateAnnouncement(admin, 'a1', input('site-3'));

    expect(update).toHaveBeenCalledTimes(1);
  });

  it('throws not found for a missing id', async () => {
    findUnique.mockResolvedValue(null);

    await expect(updateAnnouncement(admin, 'nope', input(null))).rejects.toBeInstanceOf(notFound);
    expectNoWrite();
  });
});

describe('deleteAnnouncement', () => {
  it('lets staff delete their own site row', async () => {
    stored('site-1');

    await deleteAnnouncement(staff, 'a1');

    expect(remove).toHaveBeenCalledWith({ where: { id: 'a1' } });
  });

  it('rejects staff deleting another site row', async () => {
    stored('site-2');

    await expect(deleteAnnouncement(staff, 'a1')).rejects.toBeInstanceOf(forbidden);
    expectNoWrite();
  });

  it('rejects staff deleting an all-sites row', async () => {
    stored(null);

    await expect(deleteAnnouncement(staff, 'a1')).rejects.toBeInstanceOf(forbidden);
    expectNoWrite();
  });

  it('rejects staff without a home site', async () => {
    stored('site-1');

    await expect(deleteAnnouncement(unassignedStaff, 'a1')).rejects.toBeInstanceOf(forbidden);
    expectNoWrite();
  });

  it.each([null, 'site-9'])('lets admin delete a row on %s', async (siteId) => {
    stored(siteId);

    await deleteAnnouncement(admin, 'a1');

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('throws not found for a missing id', async () => {
    findUnique.mockResolvedValue(null);

    await expect(deleteAnnouncement(admin, 'nope')).rejects.toBeInstanceOf(notFound);
    expectNoWrite();
  });
});
