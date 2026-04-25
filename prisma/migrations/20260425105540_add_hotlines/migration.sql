-- CreateTable
CREATE TABLE "Hotline" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL DEFAULT 'bg-blue-50',
    "borderColor" TEXT NOT NULL DEFAULT 'border-blue-200',
    "textColor" TEXT NOT NULL DEFAULT 'text-blue-700',
    "iconBg" TEXT NOT NULL DEFAULT 'bg-blue-500',
    "order" INTEGER NOT NULL DEFAULT 0,
    "barangayId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Hotline" ADD CONSTRAINT "Hotline_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
