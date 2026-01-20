import { Users, Calendar, ChevronRight } from "lucide-react";

interface StudentActivityCardProps {
  id: string;
  name: string;
  logo: string;
  category: string;
  members: number;
  description: string;
  onClick: (id: string) => void;
}

export const StudentActivityCard = ({
  id,
  name,
  logo,
  category,
  members,
  description,
  onClick,
}: StudentActivityCardProps) => {
  return (
    <button
      onClick={() => onClick(id)}
      className="w-full group p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 animate-fade-in tap-highlight text-left"
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-charcoal flex items-center justify-center flex-shrink-0">
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="text-xs text-primary font-semibold uppercase tracking-wider">
            {category}
          </span>
          <h3 className="text-base font-semibold text-foreground mt-1 truncate">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
          
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{members} members</span>
            </div>
          </div>
        </div>
        
        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
      </div>
    </button>
  );
};