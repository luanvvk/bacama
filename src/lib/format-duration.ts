const pad = (value: number) => String(value).padStart(2, '0');

// Lessons store seconds; a lesson with no video (an assignment, or one not yet
// uploaded) has no duration at all rather than a zero one.
export const formatDuration = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined || seconds <= 0) return null;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(remainder)}` : `${minutes}:${pad(remainder)}`;
};
