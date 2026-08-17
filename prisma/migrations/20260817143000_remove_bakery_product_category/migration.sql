-- ProductCategory.bakery represented a different business entity and is not
-- valid for Product rows. Casting through text intentionally fails if a
-- legacy bakery Product still exists instead of silently deleting data.
BEGIN;

CREATE TYPE "ProductCategory_new" AS ENUM ('coffee', 'gift');

ALTER TABLE "Product"
  ALTER COLUMN "category" TYPE "ProductCategory_new"
  USING ("category"::text::"ProductCategory_new");

DROP TYPE "ProductCategory";
ALTER TYPE "ProductCategory_new" RENAME TO "ProductCategory";

COMMIT;
