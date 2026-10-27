export const DEFAULT_TAKE = 50;
export const MAX_TAKE = 100;

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PageParams {
  take?: number;
  cursor?: string | null;
}

export const clampTake = (take?: number): number =>
  typeof take === 'number' && Number.isInteger(take) && take > 0
    ? Math.min(take, MAX_TAKE)
    : DEFAULT_TAKE;

/** Prisma `findMany` args for one page. Fetches one extra row so `toPage` can tell whether more exist. */
export const pageArgs = ({ take, cursor }: PageParams = {}) => ({
  take: clampTake(take) + 1,
  ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
});

/** Trims the extra row fetched by `pageArgs`; the cursor is the id of the last returned row. */
export const toPage = <T extends { id: string }>(rows: T[], { take }: PageParams = {}): Page<T> => {
  const size = clampTake(take);
  const items = rows.slice(0, size);

  return { items, nextCursor: rows.length > size ? items[items.length - 1].id : null };
};
