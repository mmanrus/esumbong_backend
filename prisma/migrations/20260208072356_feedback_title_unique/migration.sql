/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Feedback_title_key" ON "Feedback"("title");
