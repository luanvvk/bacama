import { mapCourse, mapCourseWithOutline } from '../map-course';

const courseRow = {
  id: 'course-1',
  slug: 'latte-art',
  format: 'online' as const,
  titleVi: 'Latte Art',
  titleEn: 'Latte Art',
  metaVi: '9 bài',
  metaEn: '9 lessons',
  descriptionVi: 'Video kèm bình luận',
  descriptionEn: 'Video lessons with live discussion',
  availabilityVi: 'Học thử miễn phí',
  availabilityEn: 'Free preview lesson',
  imageUrl: 'https://example.test/latte.jpg',
  level: null,
  topic: null,
  priceVnd: 790_000,
  isActive: true,
  instructorId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('mapCourse', () => {
  it('maps the English copy and derives the enrol CTA', () => {
    expect(mapCourse(courseRow)).toEqual({
      id: 'course-1',
      slug: 'latte-art',
      name: 'Latte Art',
      format: 'online',
      meta: '9 lessons',
      description: 'Video lessons with live discussion',
      imageUrl: 'https://example.test/latte.jpg',
      priceVnd: 790_000,
      availability: 'Free preview lesson',
      seatLimited: false,
      ctaLabel: 'Enrol',
    });
  });

  it('hyphenates the in_person format and books a seat instead', () => {
    const result = mapCourse({ ...courseRow, format: 'in_person' });

    expect(result).toMatchObject({
      format: 'in-person',
      seatLimited: true,
      ctaLabel: 'Book a seat',
    });
  });

  it('treats a hybrid course as seat-limited but still enrollable', () => {
    const result = mapCourse({ ...courseRow, format: 'hybrid' });

    expect(result).toMatchObject({ format: 'hybrid', seatLimited: true, ctaLabel: 'Enrol' });
  });

  it('drops absent optional copy rather than passing null through', () => {
    const result = mapCourse({ ...courseRow, metaEn: null, availabilityEn: null, imageUrl: null });

    expect(result.meta).toBeUndefined();
    expect(result.availability).toBeUndefined();
    expect(result.imageUrl).toBeUndefined();
  });
});

describe('mapCourseWithOutline', () => {
  const lesson = {
    id: 'lesson-1',
    moduleId: 'module-1',
    titleVi: 'Sữa và microfoam',
    titleEn: 'Milk and microfoam',
    bodyVi: null,
    bodyEn: null,
    order: 0,
    videoId: null,
    durationSec: 760,
    isFreePreview: false,
    attachments: [],
  };

  it('numbers lessons continuously across modules', () => {
    const result = mapCourseWithOutline({
      ...courseRow,
      modules: [
        {
          id: 'module-1',
          courseId: 'course-1',
          titleVi: 'A',
          titleEn: 'Module 1',
          order: 0,
          lessons: [lesson, { ...lesson, id: 'lesson-2' }],
        },
        {
          id: 'module-2',
          courseId: 'course-1',
          titleVi: 'B',
          titleEn: 'Module 2',
          order: 1,
          lessons: [{ ...lesson, id: 'lesson-3' }],
        },
      ],
    });

    expect(result.modules.flatMap((m) => m.lessons).map((l) => l.number)).toEqual([
      '01',
      '02',
      '03',
    ]);
  });

  it('formats the duration and leaves it out when there is no video', () => {
    const result = mapCourseWithOutline({
      ...courseRow,
      modules: [
        {
          id: 'module-1',
          courseId: 'course-1',
          titleVi: 'A',
          titleEn: 'Module 1',
          order: 0,
          lessons: [lesson, { ...lesson, id: 'lesson-2', durationSec: null }],
        },
      ],
    });

    expect(result.modules[0].lessons[0].duration).toBe('12:40');
    expect(result.modules[0].lessons[1].duration).toBeUndefined();
  });

  it('exposes attachment names without leaking their urls', () => {
    const result = mapCourseWithOutline({
      ...courseRow,
      modules: [
        {
          id: 'module-1',
          courseId: 'course-1',
          titleVi: 'A',
          titleEn: 'Module 1',
          order: 0,
          lessons: [
            {
              ...lesson,
              attachments: [
                {
                  id: 'file-1',
                  lessonId: 'lesson-1',
                  name: 'Milk ratio chart',
                  url: 'https://example.test/secret.pdf',
                  size: 'PDF · 240 KB',
                  createdAt: new Date('2026-01-01'),
                },
              ],
            },
          ],
        },
      ],
    });

    expect(result.modules[0].lessons[0].documents).toEqual([
      { id: 'file-1', name: 'Milk ratio chart', size: 'PDF · 240 KB' },
    ]);
  });
});
