import { Briefcase, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  skills: string[];
  isOnline: boolean;
  onConnect: (id: string) => void;
}

export const MemberCard = ({
  id,
  name,
  role,
  company,
  avatar,
  skills,
  isOnline,
  onConnect,
}: MemberCardProps) => {
  return (
    <div className="group p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300">
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Online indicator */}
          <div className={cn(
            "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card",
            isOnline ? "bg-success" : "bg-muted"
          )} />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {role}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Briefcase className="w-3.5 h-3.5" />
            <span className="truncate">{company}</span>
          </div>
        </div>
        
        {/* Connect Button */}
        <button
          onClick={() => onConnect(id)}
          className="p-2.5 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 tap-highlight"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
      
      {/* Skills */}
      <div className="flex flex-wrap gap-2 mt-4">
        {skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 text-xs font-medium rounded-full bg-secondary/50 text-secondary-foreground"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};
