/** The first lesson the learner has not completed, or the first lesson when
 * everything is done (or nothing is yet). */
export const getNextLessonId = (lessonIds: string[], completedLessonIds: string[]) =>
  lessonIds.find((id) => !completedLessonIds.includes(id)) ?? lessonIds[0];
