import LessonPage from '../page';
import { getAuthProvider } from '@/lib/providers/auth';
import { getCourseBySlug } from '@/services/courses/get-course-by-slug';
import { getLessonVideoId } from '@/services/courses/get-lesson-video-id';
import { getLearnerEnrollment } from '@/services/enrollments/get-learner-enrollment';

jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
jest.mock('next-intl/server', () => ({
  getLocale: async () => 'en',
  getTranslations: async () => (key: string) => key,
}));
jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/services/courses/get-course-by-slug', () => ({ getCourseBySlug: jest.fn() }));
jest.mock('@/services/courses/get-lesson-video-id', () => ({ getLessonVideoId: jest.fn() }));
jest.mock('@/services/enrollments/get-lesson-position', () => ({
  getLessonPosition: jest.fn().mockResolvedValue(0),
}));
jest.mock('@/services/enrollments/get-learner-enrollment', () => ({
  getLearnerEnrollment: jest.fn(),
}));
jest.mock('../../../_components/LessonPreview', () => ({
  LessonPreview: function LessonPreview() {
    return null;
  },
}));
jest.mock('@/components/layout/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/components/layout/Footer', () => ({ Footer: () => null }));

const lesson = (id: string, isFreePreview: boolean) => ({
  id,
  number: id,
  title: id,
  isFreePreview,
  documents: [],
});

const COURSE = {
  id: 'course-1',
  slug: 'latte-art',
  name: 'Latte Art',
  modules: [
    {
      id: 'm1',
      title: 'Module 1',
      lessons: [lesson('free', true), lesson('paid', false)],
    },
  ],
};

const mockUser = (user: { id: string } | null) =>
  (getAuthProvider as jest.Mock).mockReturnValue({ getCurrentUser: async () => user });

// The page's props live on the Container child, which is mocked to nothing;
// walk the returned element tree to the LessonPreview element instead.
const findPreview = (node: unknown): { props: Record<string, unknown> } | undefined => {
  if (!node || typeof node !== 'object') return undefined;
  const element = node as { type?: { name?: string }; props?: { children?: unknown } };
  if (element.type?.name === 'LessonPreview') return element as { props: Record<string, unknown> };
  const children = element.props?.children;

  return [children].flat().map(findPreview).find(Boolean);
};

const render = async (lessonId: string) =>
  findPreview(await LessonPage({ params: Promise.resolve({ courseSlug: 'latte-art', lessonId }) }));

describe('lesson page access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getCourseBySlug as jest.Mock).mockResolvedValue(COURSE);
    (getLearnerEnrollment as jest.Mock).mockResolvedValue(null);
    (getLessonVideoId as jest.Mock).mockResolvedValue('jNQXAC9IVRw');
    mockUser(null);
  });

  it('lets a guest watch the free-preview lesson, with paid lessons locked', async () => {
    const preview = await render('free');

    expect(preview?.props.embedUrl).toBe(
      'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw?rel=0&enablejsapi=1',
    );
    expect(preview?.props.isGuest).toBe(true);
    expect(preview?.props.lockedLessonIds).toEqual(['paid']);
    expect(preview?.props.nextHref).toBe('/learn/latte-art/paid');
  });

  it('sends a guest away from a paid lesson without ever reading its video id', async () => {
    await expect(render('paid')).rejects.toThrow('REDIRECT:/courses/latte-art?locked=1');
    expect(getLessonVideoId).not.toHaveBeenCalled();
  });

  it('passes no video id for any lesson to the client component', async () => {
    const preview = await render('free');

    expect(JSON.stringify(preview?.props)).not.toContain('videoId');
  });

  it('sends a signed-in user without an active enrolment away from a paid lesson', async () => {
    mockUser({ id: 'user-1' });

    await expect(render('paid')).rejects.toThrow('REDIRECT:/courses/latte-art?locked=1');
    expect(getLearnerEnrollment).toHaveBeenCalledWith('user-1', 'course-1');
  });

  it('opens a paid lesson for an enrolled user and unlocks the outline', async () => {
    mockUser({ id: 'user-1' });
    (getLearnerEnrollment as jest.Mock).mockResolvedValue({
      id: 'e1',
      completedLessonIds: ['free'],
    });

    const preview = await render('paid');

    expect(preview?.props.lockedLessonIds).toEqual([]);
    expect(preview?.props.completedLessonIds).toEqual(['free']);
    expect(preview?.props.previousHref).toBe('/learn/latte-art/free');
    expect(preview?.props.nextHref).toBeUndefined();
  });

  it('404s for an unknown lesson or course', async () => {
    await expect(render('nope')).rejects.toThrow('NOT_FOUND');
    (getCourseBySlug as jest.Mock).mockResolvedValue(null);
    await expect(render('free')).rejects.toThrow('NOT_FOUND');
  });
});
