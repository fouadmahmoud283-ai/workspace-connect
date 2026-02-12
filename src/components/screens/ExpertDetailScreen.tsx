import { ArrowLeft, Star, Briefcase, Clock, MessageCircle, Calendar, Linkedin, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ExpertDetailScreenProps {
  expert: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    expertise: string[];
    rating: number;
    sessions: number;
    isAvailable: boolean;
    bio?: string;
    experience?: string;
    hourlyRate?: string;
    languages?: string[];
    linkedin?: string;
    email?: string;
    availability?: string[];
    achievements?: string[];
  };
  onBack: () => void;
}

export const ExpertDetailScreen = ({ expert, onBack }: ExpertDetailScreenProps) => {
  const bio = expert.bio || 
    `${expert.name} is a seasoned professional with extensive experience in ${expert.expertise.join(", ")}. They are passionate about mentoring and helping others grow in their careers. With a proven track record of success, they bring valuable insights and practical knowledge to every session.`;

  const achievements = expert.achievements || [
    "10+ years industry experience",
    "Mentored 50+ professionals",
    "Speaker at major conferences",
    "Published author in field",
  ];

  const availability = expert.availability || [
    "Mon - Fri: 9:00 AM - 6:00 PM",
    "Weekends: By appointment",
  ];

  const handleBookSession = () => {
    toast.success(`Session request sent to ${expert.name}!`, {
      description: "You'll receive a confirmation shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-charcoal to-background pt-14 pb-16 safe-top">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-14 left-5 p-3 rounded-full bg-background/10 tap-highlight safe-top"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        
        {/* Avatar */}
        <div className="flex justify-center mt-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-lg">
              <img
                src={expert.avatar}
                alt={expert.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Availability indicator */}
            <div className={cn(
              "absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-background",
              expert.isAvailable ? "bg-success" : "bg-muted"
            )} />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-5 -mt-6 relative z-10">
        {/* Main Info Card */}
        <div className="p-5 rounded-2xl bg-card border border-border animate-fade-in text-center">
          <h1 className="text-2xl font-bold text-foreground">{expert.name}</h1>
          <p className="text-primary font-medium mt-1">{expert.title}</p>
          
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="font-semibold text-foreground">{expert.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">rating</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{expert.sessions} sessions</span>
            </div>
          </div>
          
          {/* Expertise Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {expert.expertise.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
          
          {/* Price & Status */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Session rate</p>
              <p className="text-xl font-bold text-primary">{expert.hourlyRate || "$75/hr"}</p>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-full text-sm font-medium",
              expert.isAvailable 
                ? "bg-success/20 text-success" 
                : "bg-muted text-muted-foreground"
            )}>
              {expert.isAvailable ? "Available" : "Busy"}
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {expert.linkedin && (
              <a
                href={expert.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors tap-highlight"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {expert.email && (
              <a
                href={`mailto:${expert.email}`}
                className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors tap-highlight"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
            <button className="p-3 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors tap-highlight">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* About */}
        <section className="mt-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
          <p className="text-muted-foreground leading-relaxed">{bio}</p>
        </section>
        
        {/* Achievements */}
        <section className="mt-6 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Achievements</h2>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div key={achievement} className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-primary/20">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{achievement}</span>
              </div>
            ))}
          </div>
        </section>
        
        {/* Availability */}
        <section className="mt-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Availability</h2>
          <div className="space-y-2">
            {availability.map((time) => (
              <div key={time} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{time}</span>
              </div>
            ))}
          </div>
        </section>
        
        {/* Book Session Button */}
        <button 
          onClick={handleBookSession}
          disabled={!expert.isAvailable}
          className={cn(
            "w-full mt-8 py-4 px-6 rounded-xl font-semibold tap-highlight transition-all duration-200",
            expert.isAvailable
              ? "bg-primary text-primary-foreground glow-primary"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {expert.isAvailable ? "Book a Session" : "Not Available"}
        </button>
      </div>
    </div>
  );
};