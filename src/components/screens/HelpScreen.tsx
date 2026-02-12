import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink,
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface HelpScreenProps {
  onBack: () => void;
}

const faqs = [
  {
    question: "How do I book a space?",
    answer: "Navigate to the Spaces tab, select a space you'd like to book, choose your preferred date and time, then confirm your booking. Credits will be deducted automatically."
  },
  {
    question: "How do credits work?",
    answer: "Credits are used to book spaces. 1 credit = 1 hour of workspace usage. Your monthly plan includes a set number of credits that reset each billing cycle."
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes, you can cancel any upcoming booking from the My Bookings section. Cancelled bookings will refund your credits automatically."
  },
  {
    question: "How do I upgrade my membership?",
    answer: "Go to Membership & Billing in your profile, select the plan you'd like to upgrade to, and complete the payment process."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept mobile wallet payments through FawryPay, including Vodafone Cash, Orange Money, Etisalat Cash, and other Egyptian e-wallets."
  },
  {
    question: "How do I change my profile information?",
    answer: "Tap the edit icon next to your name on the Profile screen to update your name and profile picture."
  },
];

const contactOptions = [
  { 
    icon: MessageCircle, 
    label: "Live Chat", 
    description: "Chat with our support team",
    action: "chat"
  },
  { 
    icon: Mail, 
    label: "Email Support", 
    description: "support@backspace.eg",
    action: "email"
  },
  { 
    icon: Phone, 
    label: "Call Us", 
    description: "+20 123 456 7890",
    action: "phone"
  },
];

const legalLinks = [
  { label: "Terms of Service", url: "/terms" },
  { label: "Privacy Policy", url: "/privacy" },
  { label: "Refund Policy", url: "/refunds" },
];

export const HelpScreen = ({ onBack }: HelpScreenProps) => {
  const handleContactAction = (action: string) => {
    switch (action) {
      case "email":
        window.open("mailto:support@backspace.eg", "_blank");
        break;
      case "phone":
        window.open("tel:+201234567890", "_blank");
        break;
      case "chat":
        // In a real app, this would open a chat widget
        alert("Live chat coming soon!");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-5 py-4 safe-top">
          <button onClick={onBack} className="p-2 -ml-2 tap-highlight">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Help & Support</h1>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">FREQUENTLY ASKED QUESTIONS</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className={cn(
                  index !== faqs.length - 1 && "border-b border-border"
                )}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/50">
                  <span className="text-left font-medium text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Contact Section */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">CONTACT US</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {contactOptions.map((option, index) => (
            <button
              key={option.label}
              onClick={() => handleContactAction(option.action)}
              className={cn(
                "flex items-center gap-4 w-full p-4 text-left tap-highlight hover:bg-secondary/50",
                index !== contactOptions.length - 1 && "border-b border-border"
              )}
            >
              <div className="p-2.5 rounded-xl bg-secondary">
                <option.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Legal Links */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">LEGAL</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {legalLinks.map((link, index) => (
            <button
              key={link.label}
              className={cn(
                "flex items-center justify-between w-full p-4 text-left tap-highlight hover:bg-secondary/50",
                index !== legalLinks.length - 1 && "border-b border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{link.label}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
