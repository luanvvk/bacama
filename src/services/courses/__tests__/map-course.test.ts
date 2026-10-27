import { formatSessionDate, mapCourse, mapCourseDetail, mapCourseWithOutline } from '../map-course';

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
    expect(mapCourse(courseRow, 'en')).toEqual({
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
    const result = mapCourse({ ...courseRow, format: 'in_person' }, 'en');

    expect(result).toMatchObject({
      format: 'in-person',
      seatLimited: true,
      ctaLabel: 'Book a seat',
    });
  });

  it('treats a hybrid course as seat-limited but still enrollable', () => {
    const result = mapCourse({ ...courseRow, format: 'hybrid' }, 'en');

    expect(result).toMatchObject({ format: 'hybrid', seatLimited: true, ctaLabel: 'Enrol' });
  });

  it('drops absent optional copy rather than passing null through', () => {
    const result = mapCourse(
      { ...courseRow, metaEn: null, availabilityEn: null, imageUrl: null },
      'en',
    );

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
    const result = mapCourseWithOutline(
      {
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
      },
      'en',
    );

    expect(result.modules.flatMap((m) => m.lessons).map((l) => l.number)).toEqual([
      '01',
      '02',
      '03',
    ]);
  });

  it('formats the duration and leaves it out when there is no video', () => {
    const result = mapCourseWithOutline(
      {
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
      },
      'en',
    );

    expect(result.modules[0].lessons[0].duration).toBe('12:40');
    expect(result.modules[0].lessons[1].duration).toBeUndefined();
  });

  it('exposes attachment names without leaking their urls', () => {
    const result = mapCourseWithOutline(
      {
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
      },
      'en',
    );

    expect(result.modules[0].lessons[0].documents).toEqual([
      { id: 'file-1', name: 'Milk ratio chart', size: 'PDF · 240 KB' },
    ]);
  });
});

describe('formatSessionDate', () => {
  it('formats in the Vietnam timezone regardless of the reader’s local one', () => {
    expect(formatSessionDate(new Date('2026-09-14T02:00:00.000Z'))).toBe('Mon, Sep 14 · 09:00');
  });
});

describe('mapCourseDetail', () => {
  it('frees seats held by lapsed pending holds', () => {
    const base = { ...courseRow, format: 'in_person' as const, modules: [] };
    const result = mapCourseDetail(
      {
        ...base,
        sessions: [
          {
            id: 'session-1',
            courseId: 'course-1',
            siteId: 'site-1',
            startsAt: new Date('2026-09-14T02:00:00.000Z'),
            capacity: 8,
            seatsBooked: 8,
            _count: { enrollments: 8 },
            site: { nameVi: 'Hội An', nameEn: 'Hoi An', slug: 'hoi-an' },
          },
        ],
      } as unknown as Parameters<typeof mapCourseDetail>[0],
      'en',
    );

    expect(result.sessions[0].seatsLeft).toBe(8);
  });

  it('computes seats left and never lets it go negative', () => {
    const result = mapCourseDetail(
      {
        ...courseRow,
        format: 'in_person',
        modules: [],
        sessions: [
          {
            id: 'session-1',
            courseId: 'course-1',
            siteId: 'site-1',
            startsAt: new Date('2026-09-14T02:00:00.000Z'),
            capacity: 8,
            seatsBooked: 5,
            _count: { enrollments: 0 },
            site: {
              id: 'site-1',
              slug: 'hoi-an',
              city: 'Hoi An',
              nameVi: 'Hội An',
              nameEn: 'Hoi An',
              addressVi: '',
              addressEn: '',
              hoursVi: '',
              hoursEn: '',
              timezone: 'Asia/Ho_Chi_Minh',
              imageUrl: null,
              opensAt: null,
              isActive: true,
              createdAt: new Date('2026-01-01'),
              updatedAt: new Date('2026-01-01'),
              todaysRoastProductId: null,
            },
          },
          {
            id: 'session-2',
            courseId: 'course-1',
            siteId: 'site-1',
            startsAt: new Date('2026-09-21T02:00:00.000Z'),
            capacity: 8,
            seatsBooked: 9,
            _count: { enrollments: 0 },
            site: {
              id: 'site-1',
              slug: 'hoi-an',
              city: 'Hoi An',
              nameVi: 'Hội An',
              nameEn: 'Hoi An',
              addressVi: '',
              addressEn: '',
              hoursVi: '',
              hoursEn: '',
              timezone: 'Asia/Ho_Chi_Minh',
              imageUrl: null,
              opensAt: null,
              isActive: true,
              createdAt: new Date('2026-01-01'),
              updatedAt: new Date('2026-01-01'),
              todaysRoastProductId: null,
            },
          },
        ],
      },
      'en',
    );

    expect(result.sessions).toEqual([
      {
        id: 'session-1',
        startsAt: 'Mon, Sep 14 · 09:00',
        siteName: 'Hoi An',
        siteSlug: 'hoi-an',
        capacity: 8,
        seatsLeft: 3,
      },
      {
        id: 'session-2',
        startsAt: 'Mon, Sep 21 · 09:00',
        siteName: 'Hoi An',
        siteSlug: 'hoi-an',
        capacity: 8,
        seatsLeft: 0,
      },
    ]);
  });
});

describe('mapCourse locale', () => {
  it('returns Vi fields on vi', () => {
    expect(mapCourse(courseRow, 'vi')).toMatchObject({
      meta: '9 bài',
      description: 'Video kèm bình luận',
      availability: 'Học thử miễn phí',
    });
  });

  it('falls back to En only when the Vi value is empty', () => {
    const result = mapCourse(
      { ...courseRow, titleVi: 'Pha latte', metaVi: '', descriptionVi: '' },
      'vi',
    );

    expect(result.name).toBe('Pha latte');
    expect(result.meta).toBe('9 lessons');
    expect(result.description).toBe('Video lessons with live discussion');
  });

  it('returns modules and lessons in Vi on vi', () => {
    const result = mapCourseWithOutline(
      {
        ...courseRow,
        modules: [
          {
            id: 'module-1',
            courseId: 'course-1',
            titleVi: 'Nền tảng',
            titleEn: 'Foundations',
            order: 0,
            lessons: [
              {
                id: 'lesson-1',
                moduleId: 'module-1',
                titleVi: 'Sữa và microfoam',
                titleEn: 'Milk and microfoam',
                bodyVi: 'Nội dung',
                bodyEn: 'Body',
                order: 0,
                videoId: null,
                durationSec: null,
                isFreePreview: false,
                attachments: [],
              },
            ],
          },
        ],
      },
      'vi',
    );

    expect(result.modules[0].title).toBe('Nền tảng');
    expect(result.modules[0].lessons[0]).toMatchObject({
      title: 'Sữa và microfoam',
      body: 'Nội dung',
    });
  });
});
