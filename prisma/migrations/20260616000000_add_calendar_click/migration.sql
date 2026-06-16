-- CreateTable
CREATE TABLE "CalendarClick" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarClick_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CalendarClick" ADD CONSTRAINT "CalendarClick_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
