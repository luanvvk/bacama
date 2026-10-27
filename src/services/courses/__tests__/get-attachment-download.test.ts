jest.mock('@/lib/prisma', () => ({ prisma: { attachment: { findUnique: jest.fn() } } }));
jest.mock('@/services/enrollments/get-learner-enrollment', () => ({
  getLearnerEnrollment: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { getLearnerEnrollment } from '@/services/enrollments/get-learner-enrollment';

import { getAttachmentDownload } from '../get-attachment-download';

const findUnique = prisma.attachment.findUnique as jest.Mock;
const enrollment = jest.mocked(getLearnerEnrollment);

const row = (isFreePreview: boolean) => ({
  url: 'https://files.example/a.pdf',
  lesson: { isFreePreview, module: { courseId: 'course-1' } },
});

beforeEach(() => jest.resetAllMocks());

describe('getAttachmentDownload', () => {
  it('returns not_found for an unknown attachment', async () => {
    findUnique.mockResolvedValue(null);

    expect(await getAttachmentDownload('x', 'user-1')).toEqual({ status: 'not_found' });
  });

  it('lets a guest download from a free-preview lesson', async () => {
    findUnique.mockResolvedValue(row(true));

    expect(await getAttachmentDownload('a1', null)).toEqual({
      status: 'ok',
      url: 'https://files.example/a.pdf',
    });
  });

  it('asks a guest to sign in for a paid lesson', async () => {
    findUnique.mockResolvedValue(row(false));

    expect(await getAttachmentDownload('a1', null)).toEqual({ status: 'unauthenticated' });
  });

  it('forbids a signed-in user without an active enrolment', async () => {
    findUnique.mockResolvedValue(row(false));
    enrollment.mockResolvedValue(null);

    expect(await getAttachmentDownload('a1', 'user-1')).toEqual({ status: 'forbidden' });
    expect(enrollment).toHaveBeenCalledWith('user-1', 'course-1');
  });

  it('gives an enrolled user the url', async () => {
    findUnique.mockResolvedValue(row(false));
    enrollment.mockResolvedValue({ id: 'e1', completedLessonIds: [] });

    expect(await getAttachmentDownload('a1', 'user-1')).toEqual({
      status: 'ok',
      url: 'https://files.example/a.pdf',
    });
  });
});
