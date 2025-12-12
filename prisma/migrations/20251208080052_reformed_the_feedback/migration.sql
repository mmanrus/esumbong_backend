/*
  Warnings:

  - You are about to drop the column `concernId` on the `FeedBack` table. All the data in the column will be lost.
  - Added the required column `suggestion` to the `FeedBack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN "description" TEXT;

-- AlterTable
ALTER TABLE "Concern" ADD COLUMN "other" TEXT;

-- CreateTable
CREATE TABLE "ConcernMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "concernId" INTEGER NOT NULL,
    CONSTRAINT "ConcernMedia_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeedBack" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "details" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "authorId" INTEGER NOT NULL,
    "suggestion" TEXT NOT NULL,
    CONSTRAINT "FeedBack_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FeedBack" ("authorId", "details", "id", "issuedAt", "updatedAt") SELECT "authorId", "details", "id", "issuedAt", "updatedAt" FROM "FeedBack";
DROP TABLE "FeedBack";
ALTER TABLE "new_FeedBack" RENAME TO "FeedBack";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
