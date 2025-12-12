/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `status` to the `ConcernUpdate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConcernUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "updateMessage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concernId" INTEGER NOT NULL,
    CONSTRAINT "ConcernUpdate_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ConcernUpdate" ("concernId", "createdAt", "id", "updateMessage") SELECT "concernId", "createdAt", "id", "updateMessage" FROM "ConcernUpdate";
DROP TABLE "ConcernUpdate";
ALTER TABLE "new_ConcernUpdate" RENAME TO "ConcernUpdate";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "position" TEXT,
    "contactNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'admin',
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("address", "contactNumber", "createAt", "email", "fullname", "id", "password", "position", "profilePhoto", "type") SELECT "address", "contactNumber", "createAt", "email", "fullname", "id", "password", "position", "profilePhoto", "type" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
