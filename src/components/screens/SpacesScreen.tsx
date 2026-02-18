import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { BookingModal } from "@/components/booking/BookingModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBookings } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";

const spaceTypes = ["All", "Meeting Room", "Focus Pod", "Open Space", "Phone Booth"];

// Keep for fallback/images
import meetingRoom from "@/assets/spaces/meeting-room.jpg";
import focusPod from "@/assets/spaces/focus-pod.jpg";
import openSpace from "@/assets/spaces/open-space.jpg";
import phoneBooth from "@/assets/spaces/phone-booth.jpg";

const fallbackImages: Record<string, string> = {
  "Meeting Room": meetingRoom,
  "Focus Pod": focusPod,
  "Open Space": openSpace,
  "Phone Booth": phoneBooth,
};

export interface SpaceData {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  image: string | null;
  amenities: string[];
  available: boolean;
  price: string;
  description: string | null;
  features: string[];
  open_hours: string;
}

// Export for backward compatibility
export const spacesData: SpaceData[] = [];

interface SpacesScreenProps {
  onSelectSpace?: (space: SpaceData) => void;
}

export const SpacesScreen = ({ onSelectSpace }: SpacesScreenProps) => {
  const [activeType, setActiveType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<SpaceData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaces, setSpaces] = useState<SpaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { createBooking, checkBookingConflict } = useBookings();

  useEffect(() => {
    const fetchSpaces = async () => {
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("available", true)
        .order("name");
      if (!error && data) {
        setSpaces(data as SpaceData[]);
      }
      setLoading(false);
    };
    fetchSpaces();
  }, []);

  const getImage = (space: SpaceData) => space.image || fallbackImages[space.type] || meetingRoom;

  const filteredSpaces = spaces.filter((space) => {
    const matchesType = activeType === "All" || space.type === activeType;
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSpaceClick = (id: string) => {
    const space = spaces.find((s) => s.id === id);
    if (space && onSelectSpace) {
      onSelectSpace({ ...space, image: getImage(space) } as any);
    }
  };

  const handleBook = (id: string) => {
    const space = spaces.find((s) => s.id === id);
    if (space) {
      setSelectedSpace(space);
      setIsModalOpen(true);
    }
  };

  const handleConfirmBooking = async (date: string, time: string, duration: number) => {
    if (!selectedSpace) return;
    const startHour = parseInt(time.split(":")[0]);
    const endHour = startHour + duration;
    const endTime = `${String(endHour).padStart(2, "0")}:00`;

    const hasConflict = await checkBookingConflict(selectedSpace.id, date, time, endTime);
    if (hasConflict) {
      toast.error("Booking unavailable", {
        description: `${selectedSpace.name} is already booked for this time slot. Please choose a different time.`,
      });
      return;
    }

    const { error } = await createBooking({
      space_id: selectedSpace.id,
      space_name: selectedSpace.name,
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
      toast.success(`Booking confirmed for ${selectedSpace.name}!`, {
        description: `${date} at ${time} for ${duration} hour(s)`,
      });
      setIsModalOpen(false);
      setSelectedSpace(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-4 safe-top">
        <h1 className="text-2xl font-bold text-foreground">Find Spaces</h1>
        <p className="text-muted-foreground mt-1">Book your perfect workspace</p>
      </div>
      
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spaces..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button className="p-2 rounded-xl bg-secondary tap-highlight">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {spaceTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 tap-highlight",
                activeType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div className="px-5 mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredSpaces.length} spaces available
        </p>
      </div>
      
      <div className="px-5">
        <div className="grid gap-4">
          {filteredSpaces.map((space, index) => (
            <div
              key={space.id}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleSpaceClick(space.id)}
              className="cursor-pointer"
            >
              <SpaceCard
                {...space}
                image={getImage(space)}
                onBook={() => handleBook(space.id)}
              />
            </div>
          ))}
        </div>
      </div>
      
      <BookingModal
        space={selectedSpace ? { id: selectedSpace.id, name: selectedSpace.name, type: selectedSpace.type, image: getImage(selectedSpace), price: selectedSpace.price } : null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSpace(null);
        }}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};
