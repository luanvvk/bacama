import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LessonPreview } from '../index';
import type { CoursePreview } from '@/services/courses/get-preview-course';

const MESSAGES: Record<string, string> = {
  freePreviewBold: "You're watching the free preview.",
  signInHint: 'Sign in to save your progress and unlock paid lessons.',
  logIn: 'Log in',
  allCourses: 'All courses →',
  tabOverview: 'Overview',
  tabDocuments: 'Documents',
  noOverview: 'No overview added for this lesson yet.',
  signInTrackProgress: 'Sign in to track your progress',
  noDocuments: 'No documents added for this lesson yet.',
  signInToDownload: 'Sign in to download',
  courseLabel: 'Course',
  videoComingSoon: 'Video coming soon.',
  lessonNavLabel: 'Lesson navigation',
  previousLesson: 'Previous',
  nextLesson: 'Next',
  lessonLocked: 'Locked',
  lessonCompleted: 'Completed',
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

const EMBED_URL = 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw?rel=0';

const guestProps = {
  preview: PREVIEW,
  embedUrl: EMBED_URL,
  isGuest: true,
  lockedLessonIds: ['lesson-1'],
  completedLessonIds: [],
};

describe('LessonPreview', () => {
  it('renders the free-preview banner and lesson content for a guest', () => {
    render(<LessonPreview {...guestProps} />);

    expect(screen.getByText(/watching the free preview/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'The heart — pour slow, finish clean' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  it('embeds the player instead of a fake play button', () => {
    render(<LessonPreview {...guestProps} />);

    expect(screen.getByTitle('The heart — pour slow, finish clean')).toHaveAttribute(
      'src',
      EMBED_URL,
    );
    expect(screen.queryByRole('button', { name: 'Play preview' })).not.toBeInTheDocument();
  });

  it('says the video is coming soon when the lesson has none', () => {
    render(<LessonPreview {...guestProps} embedUrl={null} />);

    expect(screen.getByText('Video coming soon.')).toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('hides guest prompts for a signed-in learner', () => {
    render(<LessonPreview {...guestProps} isGuest={false} lockedLessonIds={[]} />);

    expect(screen.queryByText(/watching the free preview/)).not.toBeInTheDocument();
  });

  it('shows no discussion section or invented messages', () => {
    render(<LessonPreview {...guestProps} />);

    expect(screen.queryByText('Discussion')).not.toBeInTheDocument();
    expect(screen.queryByText('Anh Minh')).not.toBeInTheDocument();
  });

  it('shows the lock icon on documents only for guests', async () => {
    const { container, unmount } = render(<LessonPreview {...guestProps} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));
    expect(container.querySelector('li svg.lucide-lock')).not.toBeNull();
    unmount();

    const signedIn = render(<LessonPreview {...guestProps} isGuest={false} lockedLessonIds={[]} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));
    expect(signedIn.container.querySelector('li svg.lucide-lock')).toBeNull();
  });

  it('links documents to the gated download route only for signed-in viewers', async () => {
    const name = 'Milk ratio & temperature chart';
    const { unmount } = render(<LessonPreview {...guestProps} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));
    expect(screen.queryByRole('link', { name })).toBeNull();
    unmount();

    render(<LessonPreview {...guestProps} isGuest={false} lockedLessonIds={[]} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', '/api/attachments/doc-1');
  });

  it('gates the documents tab behind sign-in for a guest', async () => {
    render(<LessonPreview {...guestProps} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));

    expect(screen.getByText('Milk ratio & temperature chart')).toBeInTheDocument();
    expect(screen.getAllByText('Sign in to download').length).toBeGreaterThan(0);
  });

  it('shows an honest empty state when a lesson has no documents', async () => {
    const noDocs: CoursePreview = {
      ...PREVIEW,
      lesson: { ...PREVIEW.lesson, documents: [] },
    };
    render(<LessonPreview {...guestProps} preview={noDocs} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));

    expect(screen.getByText('No documents added for this lesson yet.')).toBeInTheDocument();
  });

  it('marks locked lessons as non-links and links the rest', () => {
    render(<LessonPreview {...guestProps} />);

    expect(screen.queryByRole('link', { name: /Milk and microfoam/ })).not.toBeInTheDocument();
    expect(screen.getByText('Locked')).toHaveClass('sr-only');
    expect(screen.getByText('Milk and microfoam').closest('[aria-disabled]')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('link', { name: /The heart/, current: 'page' })).toHaveAttribute(
      'href',
      '/learn/latte-art/lesson-3',
    );
  });

  it('marks completed lessons and links every lesson once unlocked', () => {
    render(
      <LessonPreview
        {...guestProps}
        isGuest={false}
        lockedLessonIds={[]}
        completedLessonIds={['lesson-1']}
      />,
    );

    expect(screen.getByText('Completed')).toHaveClass('sr-only');
    expect(screen.getByRole('link', { name: /Milk and microfoam/ })).toHaveAttribute(
      'href',
      '/learn/latte-art/lesson-1',
    );
  });

  it('renders previous and next links', () => {
    render(
      <LessonPreview
        {...guestProps}
        previousHref="/learn/latte-art/lesson-1"
        nextHref="/learn/latte-art/lesson-4"
      />,
    );

    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/learn/latte-art/lesson-1',
    );
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'href',
      '/learn/latte-art/lesson-4',
    );
  });
});
