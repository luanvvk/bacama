const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five'];

// Small counts read better spelled out in body copy; past the list, fall back to
// the numeral rather than inventing more words.
export const countWord = (count: number) => COUNT_WORDS[count] ?? String(count);

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  count === 1 ? singular : plural;

/** "Two cafés", "One café" — always derived from the sites actually in the database. */
export const formatCafeCount = (count: number) => `${countWord(count)} ${pluralize(count, 'café')}`;
