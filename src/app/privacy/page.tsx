import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PrivacyContent } from "@/components/PrivacyContent";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-16 sm:px-6">
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  );
}
