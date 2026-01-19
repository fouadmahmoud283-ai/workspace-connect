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

const spaceTypes = ["All", "Meeting Room", "Focus Pod", "Open Space", "Phone Booth"];

const spacesData = [
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
  },
];

export const SpacesScreen = () => {
  const [activeType, setActiveType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<typeof spacesData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSpaces = spacesData.filter((space) => {
    const matchesType = activeType === "All" || space.type === activeType;
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleBook = (id: string) => {
    const space = spacesData.find((s) => s.id === id);
    if (space) {
      setSelectedSpace(space);
      setIsModalOpen(true);
    }
  };

  const handleConfirmBooking = (date: string, time: string, duration: number) => {
    toast.success(`Booking confirmed for ${selectedSpace?.name}!`, {
      description: `${date} at ${time} for ${duration} hour(s)`,
    });
    setIsModalOpen(false);
    setSelectedSpace(null);
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
            >
              <SpaceCard {...space} onBook={handleBook} />
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
