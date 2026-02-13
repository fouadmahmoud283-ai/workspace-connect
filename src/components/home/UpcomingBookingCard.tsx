import { Calendar, Clock, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingBooking {
  id: string;
  spaceName: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  image: string;
}

interface UpcomingBookingCardProps {
  booking: UpcomingBooking;
  onCancel: (id: string) => void;
}

export const UpcomingBookingCard = ({ booking, onCancel }: UpcomingBookingCardProps) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border animate-fade-in">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={booking.image}
          alt={booking.spaceName}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs text-primary font-semibold uppercase tracking-wider">
              Upcoming
            </span>
            <h3 className="text-lg font-semibold text-foreground mt-1">
              {booking.spaceName}
            </h3>
          </div>
          
          <button
            onClick={() => onCancel(booking.id)}
            className="p-2 rounded-full hover:bg-destructive/20 transition-colors tap-highlight"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-secondary/50 flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">{booking.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-secondary/50 flex-shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium text-foreground">{booking.time}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-secondary/50 flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Floor</p>
                <p className="text-sm font-medium text-foreground">{booking.location}</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
