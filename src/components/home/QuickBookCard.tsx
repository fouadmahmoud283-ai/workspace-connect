import { ArrowRight, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickBookCardProps {
  name: string;
  image: string;
  lastVisit: string;
  location: string;
  onBook: () => void;
}

export const QuickBookCard = ({
  name,
  image,
  lastVisit,
  location,
  onBook,
}: QuickBookCardProps) => {
  return (
    <button
      onClick={onBook}
      className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 w-full text-left tap-highlight"
    >
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{name}</h3>
        <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Last visit: {lastVisit}</span>
        </div>
      </div>
      
      {/* Arrow */}
      <div className="p-2 rounded-full bg-secondary group-hover:bg-primary transition-all duration-200">
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
      </div>
    </button>
  );
};
