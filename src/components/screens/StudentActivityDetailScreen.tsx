import { ArrowLeft, Users, Calendar, MapPin, Globe, Instagram, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentActivityDetailScreenProps {
  activity: {
    id: string;
    name: string;
    logo: string;
    category: string;
    members: number;
    description: string;
    longDescription?: string;
    founded?: string;
    location?: string;
    website?: string;
    instagram?: string;
    email?: string;
    events?: { name: string; date: string }[];
    benefits?: string[];
  };
  onBack: () => void;
}

export const StudentActivityDetailScreen = ({ activity, onBack }: StudentActivityDetailScreenProps) => {
  const longDescription = activity.longDescription || 
    `${activity.name} is one of our proud student activity partners. They have been collaborating with Backspace to bring innovative events and opportunities to our community. Their members enjoy exclusive access to our spaces for meetings, workshops, and collaborative sessions.`;

  const benefits = activity.benefits || [
    "Free meeting room access (10 hrs/month)",
    "Priority event booking",
    "Member discounts on workspace",
    "Networking with professionals",
    "Workshop hosting support",
  ];

  const events = activity.events || [
    { name: "Monthly Meetup", date: "Every last Friday" },
    { name: "Annual Conference", date: "Coming Soon" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative bg-charcoal pt-14 pb-20 safe-top">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-14 left-5 p-3 rounded-full bg-background/10 tap-highlight safe-top"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        
        {/* Logo */}
        <div className="flex justify-center mt-8">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-background border-4 border-background shadow-lg">
            <img
              src={activity.logo}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-5 -mt-10 relative z-10">
        {/* Main Info Card */}
        <div className="p-5 rounded-2xl bg-card border border-border animate-fade-in text-center">
          <span className="text-xs text-primary font-semibold uppercase tracking-wider">
            {activity.category}
          </span>
          <h1 className="text-2xl font-bold text-foreground mt-2">{activity.name}</h1>
          <p className="text-muted-foreground mt-2">{activity.description}</p>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{activity.members} members</span>
            </div>
            {activity.founded && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Since {activity.founded}</span>
              </div>
            )}
          </div>
          
          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {activity.website && (
              <a
                href={activity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors tap-highlight"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
            {activity.instagram && (
              <a
                href={activity.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors tap-highlight"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {activity.email && (
              <a
                href={`mailto:${activity.email}`}
                className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors tap-highlight"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
        
        {/* About */}
        <section className="mt-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
          <p className="text-muted-foreground leading-relaxed">{longDescription}</p>
        </section>
        
        {/* Partnership Benefits */}
        <section className="mt-6 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Partnership Benefits</h2>
          <div className="space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-primary/20">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </section>
        
        {/* Upcoming Events */}
        <section className="mt-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Events</h2>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.name} className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-medium text-foreground">{event.name}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Contact Button */}
        <button className="w-full mt-8 py-4 px-6 rounded-xl bg-primary text-primary-foreground font-semibold tap-highlight glow-primary">
          Contact Activity
        </button>
      </div>
    </div>
  );
};