jest.mock('@/lib/prisma', () => ({
  prisma: { course: { findFirst: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getPreviewCourse } from '../get-preview-course';

const mockFindFirst = prisma.course.findFirst as jest.Mock;

const lesson = (overrides: Record<string, unknown>) => ({
  id: 'lesson-1',
  titleEn: 'Milk and microfoam',
  bodyEn: null,
  durationSec: 760,
  isFreePreview: false,
  attachments: [],
  ...overrides,
});

describe('getPreviewCourse', () => {
  afterEach(() => {
    mockFindFirst.mockReset();
  });

  it('only considers courses that actually have a free lesson', async () => {
    mockFindFirst.mockResolvedValue(null);

    await getPreviewCourse();

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          modules: { some: { lessons: { some: { isFreePreview: true } } } },
        },
      }),
    );
  });

  it('returns null when no course has one', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(getPreviewCourse()).resolves.toBeNull();
  });

  it('picks the free lesson and labels it with its module', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'course-1',
      slug: 'latte-art',
      format: 'online',
      titleEn: 'Latte Art',
      metaEn: '9 lessons',
      descriptionEn: 'Video lessons',
      availabilityEn: 'Free preview lesson',
      imageUrl: null,
      priceVnd: 790_000,
      modules: [
        {
          id: 'module-1',
          titleEn: 'Module 1 · Foundations',
          lessons: [
            lesson({}),
            lesson({
              id: 'lesson-2',
              titleEn: 'The heart',
              isFreePreview: true,
              bodyEn: 'Pour slow.',
            }),
          ],
        },
      ],
    });

    const result = await getPreviewCourse();

    expect(result).toMatchObject({
      moduleLabel: 'Module 1 · Foundations · Lesson 02',
      lesson: { title: 'The heart', body: 'Pour slow.', number: '02' },
      course: { name: 'Latte Art' },
    });
  });
});
