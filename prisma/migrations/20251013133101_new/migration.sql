/*
  Warnings:

  - You are about to drop the `Noticication` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `outcome` to the `Mediation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedule` to the `Mediation` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Noticication";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "url" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Concern" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "details" TEXT NOT NULL,
    "location" TEXT,
    "categoryId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" INTEGER NOT NULL,
    "updatedAt" DATETIME,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Concern_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Concern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Concern" ("details", "id", "issuedAt", "status", "title", "updatedAt", "userId") SELECT "details", "id", "issuedAt", "status", "title", "updatedAt", "userId" FROM "Concern";
DROP TABLE "Concern";
ALTER TABLE "new_Concern" RENAME TO "Concern";
CREATE TABLE "new_Mediation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "residentId" INTEGER NOT NULL,
    "officialId" INTEGER NOT NULL,
    "concernId" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "schedule" DATETIME NOT NULL,
    "updatedAt" DATETIME,
    CONSTRAINT "Mediation_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mediation_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mediation_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mediation" ("concernId", "id", "officialId", "residentId") SELECT "concernId", "id", "officialId", "residentId" FROM "Mediation";
DROP TABLE "Mediation";
ALTER TABLE "new_Mediation" RENAME TO "Mediation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
