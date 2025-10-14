-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "position" TEXT,
    "contactNumber" TEXT NOT NULL,
    "role" TEXT,
    "type" TEXT NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Concern" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "updatedAt" DATETIME,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Concern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeedBack" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "details" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "authorId" INTEGER NOT NULL,
    "concernId" INTEGER NOT NULL,
    CONSTRAINT "FeedBack_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeedBack_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Summons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "residentId" INTEGER NOT NULL,
    "officialId" INTEGER NOT NULL,
    "concernId" INTEGER NOT NULL,
    "remarks" TEXT,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Summons_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Summons_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Summons_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mediation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "residentId" INTEGER NOT NULL,
    "officialId" INTEGER NOT NULL,
    "concernId" INTEGER NOT NULL,
    CONSTRAINT "Mediation_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mediation_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mediation_concernId_fkey" FOREIGN KEY ("concernId") REFERENCES "Concern" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Noticication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "url" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Noticication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemFeedback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "SystemFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
