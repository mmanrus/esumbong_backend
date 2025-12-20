-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("address", "contactNumber", "createAt", "email", "fullname", "id", "password", "position", "profilePhoto", "type") SELECT "address", "contactNumber", "createAt", "email", "fullname", "id", "password", "position", "profilePhoto", "type" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
