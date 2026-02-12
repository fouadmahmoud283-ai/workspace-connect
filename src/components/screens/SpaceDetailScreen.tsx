import { ArrowLeft, MapPin, Users, Clock, Wifi, Coffee, Monitor, Tv, Printer, AirVent, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BookingModal } from "@/components/booking/BookingModal";
import { toast } from "sonner";
import { useBookings } from "@/hooks/useBookings";

interface SpaceDetailScreenProps {
  space: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    location: string;
    image: string;
    amenities: string[];
    available: boolean;
    price: string;
    description?: string;
    features?: string[];
    openHours?: string;
  };
  onBack: () => void;
}

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  coffee: Coffee,
  monitor: Monitor,
  tv: Tv,
  printer: Printer,
  ac: AirVent,
};

export const SpaceDetailScreen = ({ space, onBack }: SpaceDetailScreenProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createBooking, checkBookingConflict } = useBookings();

  const handleConfirmBooking = async (date: string, time: string, duration: number) => {
    const startHour = parseInt(time.split(":")[0]);
    const endHour = startHour + duration;
    const endTime = `${String(endHour).padStart(2, "0")}:00`;

    const hasConflict = await checkBookingConflict(space.id, date, time, endTime);
    if (hasConflict) {
      toast.error("Booking unavailable", {
        description: `${space.name} is already booked for this time slot. Please choose a different time.`,
      });
      return;
    }

    const { error } = await createBooking({
      space_id: space.id,
      space_name: space.name,
      booking_date: date,
      start_time: time,
      end_time: endTime,
      status: "confirmed",
      credits_used: duration,
      notes: null,
    });

    if (error) {
      toast.error("Booking failed", { description: error.message });
    } else {
      toast.success(`Booking confirmed for ${space.name}!`, {
        description: `${date} at ${time} for ${duration} hour(s)`,
      });
      setIsModalOpen(false);
    }
  };

  const features = space.features || [
    "High-speed WiFi (1Gbps)",
    "Ergonomic furniture",
    "Natural lighting",
    "Soundproofing",
    "Climate control",
    "24/7 access available",
  ];

  const description = space.description || 
    `${space.name} is a premium ${space.type.toLowerCase()} designed for productivity and comfort. Located on ${space.location}, this space offers everything you need for focused work or collaborative sessions.`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-72">
        <img
          src={space.image}
          alt={space.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-14 left-5 p-3 rounded-full glass tap-highlight safe-top"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        
        {/* Status Badge */}
        <div className={cn(
          "absolute top-14 right-5 px-4 py-2 rounded-full text-sm font-semibold safe-top",
          space.available 
            ? "bg-success/20 text-success border border-success/30" 
            : "bg-destructive/20 text-destructive border border-destructive/30"
        )}>
          {space.available ? "Available Now" : "Occupied"}
        </div>
      </div>
      
      {/* Content */}
      <div className="px-5 -mt-8 relative z-10">
        {/* Main Info Card */}
        <div className="p-5 rounded-2xl bg-card border border-border animate-fade-in">
          <span className="text-xs text-primary font-semibold uppercase tracking-wider">
            {space.type}
          </span>
          <h1 className="text-2xl font-bold text-foreground mt-2">{space.name}</h1>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{space.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Up to {space.capacity} people</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {space.openHours || "8:00 AM - 10:00 PM"}
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Starting from</p>
              <p className="text-2xl font-bold text-primary">{space.price}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!space.available}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold transition-all duration-200 tap-highlight",
                space.available
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {space.available ? "Book Now" : "Not Available"}
            </button>
          </div>
        </div>
        
        {/* Description */}
        <section className="mt-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">About this space</h2>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </section>
        
        {/* Amenities */}
        <section className="mt-6 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Amenities</h2>
          <div className="grid grid-cols-3 gap-3">
            {space.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity.toLowerCase()] || Wifi;
              return (
                <div
                  key={amenity}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border"
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="text-xs text-muted-foreground text-center">{amenity}</span>
                </div>
              );
            })}
          </div>
        </section>
        
        {/* Features */}
        <section className="mt-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Features</h2>
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-primary/20">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Booking Modal */}
      <BookingModal
        space={space}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};