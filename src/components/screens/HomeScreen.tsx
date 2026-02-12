import { Search, Bell, Sparkles } from "lucide-react";
import { QuickBookCard } from "@/components/home/QuickBookCard";
import { UpcomingBookingCard } from "@/components/home/UpcomingBookingCard";
import logo from "@/assets/logo.jpg";
import meetingRoom from "@/assets/spaces/meeting-room.jpg";
import focusPod from "@/assets/spaces/focus-pod.jpg";

interface HomeScreenProps {
  onNavigateToSpaces: () => void;
}

const quickBookSpaces = [
  {
    name: "Meeting Room Alpha",
    image: meetingRoom,
    lastVisit: "2 days ago",
    location: "Floor 3",
  },
  {
    name: "Focus Pod #12",
    image: focusPod,
    lastVisit: "Yesterday",
    location: "Floor 2",
  },
];

const upcomingBookings = [
  {
    id: "1",
    spaceName: "Conference Room B",
    date: "Today",
    time: "2:00 PM",
    duration: "2h",
    location: "Floor 4",
    image: meetingRoom,
  },
];

export const HomeScreen = ({ onNavigateToSpaces }: HomeScreenProps) => {
  const handleCancelBooking = (id: string) => {
    console.log("Cancel booking:", id);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative">
        {/* Top Bar with Logo */}
        <div className="bg-charcoal pt-4 pb-8 safe-top">
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Backspace"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">Backspace</h1>
                <p className="text-xs text-muted-foreground">We Create Community</p>
              </div>
            </div>
            <button className="p-3 rounded-full bg-background/10 tap-highlight">
              <Bell className="w-5 h-5 text-foreground" />
            </button>
          </div>
          
          {/* Welcome Message */}
          <div className="px-5 mt-6">
            <p className="text-sm text-foreground/70">Good morning,</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">Welcome back! 👋</h2>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="absolute -bottom-6 left-5 right-5">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border shadow-lg">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search spaces, members..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-5 pt-12 space-y-8">
        {/* Stats */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border animate-fade-in">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">This month</p>
            <p className="text-lg font-semibold text-foreground">
              12 hours booked
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Credits</p>
            <p className="text-lg font-bold text-primary">24</p>
          </div>
        </div>
        
        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Upcoming Bookings
            </h2>
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <UpcomingBookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          </section>
        )}
        
        {/* Quick Book */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Quick Book
            </h2>
            <button 
              onClick={onNavigateToSpaces}
              className="text-sm text-primary font-medium tap-highlight"
            >
              See all
            </button>
          </div>
          <div className="space-y-3">
            {quickBookSpaces.map((space) => (
              <QuickBookCard
                key={space.name}
                {...space}
                onBook={() => console.log("Book:", space.name)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};