import { Star, ChevronRight, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpertCardProps {
  id: string;
  name: string;
  avatar: string;
  title: string;
  expertise: string[];
  rating: number;
  sessions: number;
  isAvailable: boolean;
  onClick: (id: string) => void;
}

export const ExpertCard = ({
  id,
  name,
  avatar,
  title,
  expertise,
  rating,
  sessions,
  isAvailable,
  onClick,
}: ExpertCardProps) => {
  return (
    <button
      onClick={() => onClick(id)}
      className="w-full group p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 animate-fade-in tap-highlight text-left"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300">
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Availability indicator */}
          <div className={cn(
            "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card",
            isAvailable ? "bg-success" : "bg-muted"
          )} />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {title}
          </p>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{sessions} sessions</span>
            </div>
          </div>
        </div>
        
        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
      </div>
      
      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {expertise.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
          >
            {skill}
          </span>
        ))}
      </div>
    </button>
  );
};