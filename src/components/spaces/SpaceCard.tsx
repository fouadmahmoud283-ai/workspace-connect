import { Clock, MapPin, Users, Wifi, Coffee, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpaceCardProps {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  image: string;
  amenities: string[];
  available: boolean;
  price: string;
  onBook: (id: string) => void;
}

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  coffee: Coffee,
  monitor: Monitor,
};

export const SpaceCard = ({
  id,
  name,
  type,
  capacity,
  location,
  image,
  amenities,
  available,
  price,
  onBook,
}: SpaceCardProps) => {
  return (
    <div className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 animate-fade-in">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        {/* Status Badge */}
        <div className={cn(
          "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold",
          available 
            ? "bg-success/20 text-success border border-success/30" 
            : "bg-destructive/20 text-destructive border border-destructive/30"
        )}>
          {available ? "Available" : "Occupied"}
        </div>
        
        {/* Price */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {price}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <span className="text-xs text-primary font-medium uppercase tracking-wider">
            {type}
          </span>
          <h3 className="text-lg font-semibold text-foreground mt-1">
            {name}
          </h3>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{capacity}</span>
          </div>
        </div>
        
        {/* Amenities */}
        <div className="flex items-center gap-2">
          {amenities.slice(0, 3).map((amenity) => {
            const Icon = amenityIcons[amenity.toLowerCase()] || Wifi;
            return (
              <div
                key={amenity}
                className="p-2 rounded-lg bg-secondary/50"
                title={amenity}
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
            );
          })}
        </div>
        
        {/* Book Button */}
        <button
          onClick={() => onBook(id)}
          disabled={!available}
          className={cn(
            "w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 tap-highlight",
            available
              ? "bg-primary text-primary-foreground hover:opacity-90 glow-primary"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {available ? "Book Now" : "Not Available"}
        </button>
      </div>
    </div>
  );
};
