import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { TermsContent } from "@/components/TermsContent";

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-16 sm:px-6">
        <TermsContent />
      </main>
      <Footer />
    </div>
  );
}
