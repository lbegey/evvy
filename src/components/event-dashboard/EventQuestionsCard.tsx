"use client";

import { HelpCircle } from "lucide-react";
import { EventQuestionsSection, type RsvpQuestion } from "@/components/EventQuestionsSection";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  eventId: string;
  plan: string;
  questions: RsvpQuestion[];
}

export function EventQuestionsCard({ eventId, plan, questions }: Props) {
  const { T } = useLanguage();
  return (
    <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><HelpCircle className="h-[18px] w-[18px]" /></span>
        <div>
          <h2 className="font-display text-base font-bold leading-none">{T.dashboardDetail.sidebar.questions}</h2>
          <p className="mt-1 text-xs text-inksoft">{T.eventDashboard.questionsSubtitle}</p>
        </div>
      </div>
      <EventQuestionsSection eventId={eventId} plan={plan} questions={questions} />
    </div>
  );
}
