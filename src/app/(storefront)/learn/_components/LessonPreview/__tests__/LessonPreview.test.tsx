import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LessonPreview } from '../index';
import { toast } from '@/lib/toast';
import type { CoursePreview } from '@/services/courses/get-preview-course';

jest.mock('@/lib/toast', () => ({ toast: jest.fn() }));

const MESSAGES: Record<string, string> = {
  freePreviewBold: "You're watching the free preview.",
  signInHint: 'Sign in to save your progress and unlock paid lessons.',
  signInToWatch: 'Sign in to watch the full lesson.',
  logIn: 'Log in',
  allCourses: 'All courses →',
  playAriaLabel: 'Play preview',
  tabOverview: 'Overview',
  tabDocuments: 'Documents',
  noOverview: 'No overview added for this lesson yet.',
  signInTrackProgress: 'Sign in to track your progress',
  noDocuments: 'No documents added for this lesson yet.',
  signInToDownload: 'Sign in to download',
  courseLabel: 'Course',
  discussionTitle: 'Discussion',
  logInToJoin: 'Log in to join the discussion',
  teacherRoleLabel: 'Teacher',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { count: number }) =>
    key === 'lessonCount' ? `${params?.count} lesson(s)` : MESSAGES[key],
}));

const PREVIEW: CoursePreview = {
  course: {
    id: 'course-1',
    slug: 'latte-art',
    name: 'Latte Art',
    format: 'online',
    description: 'Video lessons with live discussion.',
    priceVnd: 790_000,
    seatLimited: false,
    ctaLabel: 'Enrol',
    modules: [
      {
        id: 'module-1',
        title: 'Module 1 · Foundations',
        lessons: [
          {
            id: 'lesson-1',
            number: '01',
            title: 'Milk and microfoam',
            duration: '12:40',
            isFreePreview: false,
            documents: [],
          },
          {
            id: 'lesson-3',
            number: '03',
            title: 'The heart — pour slow, finish clean',
            duration: '11:05',
            isFreePreview: true,
            documents: [
              { id: 'doc-1', name: 'Milk ratio & temperature chart', size: 'PDF · 240 KB' },
            ],
            body: 'The heart comes first because it teaches three things at once.',
          },
        ],
      },
    ],
  },
  lesson: {
    id: 'lesson-3',
    number: '03',
    title: 'The heart — pour slow, finish clean',
    duration: '11:05',
    isFreePreview: true,
    documents: [{ id: 'doc-1', name: 'Milk ratio & temperature chart', size: 'PDF · 240 KB' }],
    body: 'The heart comes first because it teaches three things at once.',
  },
  moduleLabel: 'Module 1 · Foundations · Lesson 03',
};

describe('LessonPreview', () => {
  it('renders the free-preview banner and lesson content', () => {
    render(<LessonPreview preview={PREVIEW} />);

    expect(screen.getByText(/watching the free preview/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'The heart — pour slow, finish clean' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  it('shows a sign-in toast instead of playing a real video', async () => {
    render(<LessonPreview preview={PREVIEW} />);

    await userEvent.click(screen.getByRole('button', { name: 'Play preview' }));

    expect(toast).toHaveBeenCalledWith('Sign in to watch the full lesson.');
  });

  it('gates the documents tab behind sign-in', async () => {
    render(<LessonPreview preview={PREVIEW} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));

    expect(screen.getByText('Milk ratio & temperature chart')).toBeInTheDocument();
    expect(screen.getAllByText('Sign in to download').length).toBeGreaterThan(0);
  });

  it('shows an honest empty state when a lesson has no documents', async () => {
    const noDocs: CoursePreview = {
      ...PREVIEW,
      lesson: { ...PREVIEW.lesson, documents: [] },
    };
    render(<LessonPreview preview={noDocs} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));

    expect(screen.getByText('No documents added for this lesson yet.')).toBeInTheDocument();
  });

  it('renders the course outline with the current lesson marked', () => {
    render(<LessonPreview preview={PREVIEW} />);

    expect(screen.getByText('Milk and microfoam')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in to join the discussion' })).toHaveAttribute(
      'href',
      '/login',
    );
  });
});
