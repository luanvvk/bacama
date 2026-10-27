import { getNextLessonId } from '../get-next-lesson-id';

describe('getNextLessonId', () => {
  const lessons = ['a', 'b', 'c'];

  it('returns the first lesson when nothing is completed', () => {
    expect(getNextLessonId(lessons, [])).toBe('a');
  });

  it('returns the first unfinished lesson', () => {
    expect(getNextLessonId(lessons, ['a', 'c'])).toBe('b');
  });

  it('returns the first lesson when all are completed', () => {
    expect(getNextLessonId(lessons, lessons)).toBe('a');
  });

  it('returns undefined for a course without lessons', () => {
    expect(getNextLessonId([], [])).toBeUndefined();
  });
});
