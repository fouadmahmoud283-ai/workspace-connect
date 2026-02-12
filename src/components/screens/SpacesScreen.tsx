import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { BookingModal } from "@/components/booking/BookingModal";
import { cn } from "@/lib/utils";
import meetingRoom from "@/assets/spaces/meeting-room.jpg";
import focusPod from "@/assets/spaces/focus-pod.jpg";
import openSpace from "@/assets/spaces/open-space.jpg";
import phoneBooth from "@/assets/spaces/phone-booth.jpg";
import { toast } from "sonner";
import { useBookings } from "@/hooks/useBookings";

const spaceTypes = ["All", "Meeting Room", "Focus Pod", "Open Space", "Phone Booth"];

export const spacesData = [
  {
    id: "1",
    name: "Meeting Room Alpha",
    type: "Meeting Room",
    capacity: 8,
    location: "Floor 3",
    image: meetingRoom,
    amenities: ["Wifi", "Monitor", "Coffee"],
    available: true,
    price: "$25/hr",
    description: "A modern meeting room perfect for team collaborations and client presentations. Features state-of-the-art AV equipment and comfortable seating.",
    features: ["Video conferencing setup", "Whiteboard", "High-speed WiFi", "Coffee machine", "Natural lighting", "Ergonomic chairs"],
    openHours: "7:00 AM - 11:00 PM",
  },
  {
    id: "2",
    name: "Focus Pod #12",
    type: "Focus Pod",
    capacity: 1,
    location: "Floor 2",
    image: focusPod,
    amenities: ["Wifi", "Monitor"],
    available: true,
    price: "$12/hr",
    description: "A private, soundproof pod designed for deep work and concentration. Perfect for calls, coding, or focused reading.",
    features: ["Soundproofing", "Adjustable lighting", "Ergonomic chair", "Monitor stand", "USB charging", "Climate control"],
    openHours: "24/7 Access",
  },
  {
    id: "3",
    name: "Creative Hub",
    type: "Open Space",
    capacity: 20,
    location: "Floor 1",
    image: openSpace,
    amenities: ["Wifi", "Coffee"],
    available: false,
    price: "$8/hr",
    description: "An open collaborative space perfect for workshops, team activities, or casual working. Flexible seating arrangements available.",
    features: ["Flexible layout", "Multiple power outlets", "Bean bags", "Standing desks", "Coffee bar access", "Collaborative tools"],
    openHours: "8:00 AM - 10:00 PM",
  },
  {
    id: "4",
    name: "Quiet Booth A",
    type: "Phone Booth",
    capacity: 1,
    location: "Floor 2",
    image: phoneBooth,
    amenities: ["Wifi"],
    available: true,
    price: "$5/hr",
    description: "A compact phone booth for quick calls, video meetings, or private conversations. Fully soundproofed for confidentiality.",
    features: ["Full soundproofing", "Video call lighting", "Mirror", "Coat hook", "Ventilation", "Power outlet"],
    openHours: "24/7 Access",
  },
];

interface SpacesScreenProps {
  onSelectSpace?: (space: typeof spacesData[0]) => void;
}

export const SpacesScreen = ({ onSelectSpace }: SpacesScreenProps) => {
  const [activeType, setActiveType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<typeof spacesData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createBooking, checkBookingConflict } = useBookings();

  const filteredSpaces = spacesData.filter((space) => {
    const matchesType = activeType === "All" || space.type === activeType;
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSpaceClick = (id: string) => {
    const space = spacesData.find((s) => s.id === id);
    if (space && onSelectSpace) {
      onSelectSpace(space);
    }
  };

  const handleBook = (id: string) => {
    const space = spacesData.find((s) => s.id === id);
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 safe-top">
        <h1 className="text-2xl font-bold text-foreground">Find Spaces</h1>
        <p className="text-muted-foreground mt-1">Book your perfect workspace</p>
      </div>
      
      {/* Search */}
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
      
      {/* Type Filter */}
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
      
      {/* Results Count */}
      <div className="px-5 mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredSpaces.length} spaces available
        </p>
      </div>
      
      {/* Spaces Grid */}
      <div className="px-5">
        <div className="grid gap-4">
          {filteredSpaces.map((space, index) => (
            <div
              key={space.id}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleSpaceClick(space.id)}
              className="cursor-pointer"
            >
              <SpaceCard {...space} onBook={() => handleBook(space.id)} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Booking Modal */}
      <BookingModal
        space={selectedSpace}
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