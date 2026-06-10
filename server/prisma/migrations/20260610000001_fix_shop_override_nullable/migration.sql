-- AlterTable: Make is_open_override nullable so NULL can represent "no override, use schedule"
-- The initial migration created this column as NOT NULL DEFAULT false,
-- but the Prisma schema defines it as Boolean? (nullable). This migration corrects that.
ALTER TABLE "shop_settings" ALTER COLUMN "is_open_override" DROP NOT NULL;
ALTER TABLE "shop_settings" ALTER COLUMN "is_open_override" DROP DEFAULT;
