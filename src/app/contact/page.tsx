import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div
      className="evvy-theme flex min-h-full flex-col bg-white"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <SiteHeader />
      <ContactForm />
      <Footer />
    </div>
  );
}
