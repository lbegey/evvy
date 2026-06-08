import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <ContactForm />
      <Footer />
    </div>
  );
}
