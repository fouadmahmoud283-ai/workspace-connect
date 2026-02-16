import { Search, Bell, Sparkles, Calendar, Clock, MapPin, ArrowRight, TrendingUp, Users, Zap } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useBookings } from "@/hooks/useBookings";
import logo from "@/assets/logo.jpg";
import meetingRoom from "@/assets/spaces/meeting-room.jpg";
import focusPod from "@/assets/spaces/focus-pod.jpg";
import openSpace from "@/assets/spaces/open-space.jpg";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

interface HomeScreenProps {
  onNavigateToSpaces: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToNotifications?: () => void;
}

const quickBookSpaces = [
  { name: "Meeting Room Alpha", image: meetingRoom, location: "Floor 3", capacity: "6 people" },
  { name: "Focus Pod #12", image: focusPod, location: "Floor 2", capacity: "1 person" },
  { name: "Open Workspace", image: openSpace, location: "Floor 1", capacity: "20 people" },
];

const formatBookingDate = (dateStr: string) => {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
};

const formatTime = (time: string) => {
  const [h] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display}:00 ${ampm}`;
};

export const HomeScreen = ({ onNavigateToSpaces, onNavigateToBookings, onNavigateToNotifications }: HomeScreenProps) => {
  const { profile } = useProfile();
  const { upcomingBookings, bookings } = useBookings();

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const totalHours = bookings.filter(b => b.status === "confirmed" || b.status === "completed").length * 2;
  const credits = profile?.credits ?? 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with glow */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        <div className="relative bg-charcoal pt-4 pb-10 safe-top">
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Backspace" className="w-11 h-11 rounded-xl object-cover ring-2 ring-primary/30" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Backspace</h1>
                <p className="text-[11px] text-muted-foreground tracking-wide">CO-WORKING SPACE</p>
              </div>
            </div>
            <button
              onClick={onNavigateToNotifications}
              className="relative p-2.5 rounded-full bg-secondary tap-highlight"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>
          </div>

          <div className="px-5 mt-6">
            <p className="text-sm text-foreground/60">{getGreeting()},</p>
            <h2 className="text-2xl font-bold text-foreground mt-0.5">{firstName} 👋</h2>
          </div>
        </div>

        {/* Search Bar floating */}
        <div className="absolute -bottom-6 left-5 right-5 z-10">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border shadow-lg">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search spaces, members..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="px-5 pt-12 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{totalHours}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Hours</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-primary">{credits}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Credits</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{upcomingBookings.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Upcoming</p>
          </div>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Upcoming</h2>
              <button onClick={onNavigateToBookings} className="text-xs text-primary font-medium tap-highlight">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {upcomingBookings.slice(0, 2).map((booking) => (
                <div key={booking.id} className="relative rounded-2xl overflow-hidden bg-card border border-border">
                  <div className="absolute inset-0 bg-gradient-glow opacity-30" />
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                        {formatBookingDate(booking.booking_date)}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {booking.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{booking.space_name}</h3>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{booking.credits_used} credits</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state for no bookings */}
        {upcomingBookings.length === 0 && (
          <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="p-6 rounded-2xl bg-card border border-border border-dashed text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">No upcoming bookings</p>
              <p className="text-xs text-muted-foreground mt-1">Book a space to get started</p>
              <button
                onClick={onNavigateToSpaces}
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold tap-highlight"
              >
                Browse Spaces
              </button>
            </div>
          </section>
        )}

        {/* Quick Book */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Quick Book</h2>
            <button onClick={onNavigateToSpaces} className="text-xs text-primary font-medium tap-highlight">
              See all
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {quickBookSpaces.map((space) => (
              <button
                key={space.name}
                onClick={onNavigateToSpaces}
                className="group flex-shrink-0 w-40 rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all tap-highlight"
              >
                <div className="h-24 overflow-hidden">
                  <img src={space.image} alt={space.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-foreground truncate">{space.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{space.location}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{space.capacity}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Membership Banner */}
        <section className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="relative rounded-2xl overflow-hidden p-5" style={{ background: "var(--gradient-primary)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-background/10 -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-background/10 -ml-6 -mb-6" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
                <span className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider">
                  {profile?.membership_type || "Basic"} Plan
                </span>
              </div>
              <h3 className="text-lg font-bold text-primary-foreground">
                Upgrade for more credits
              </h3>
              <p className="text-sm text-primary-foreground/70 mt-1">
                Get unlimited access to all spaces
              </p>
              <button className="mt-4 px-5 py-2.5 rounded-xl bg-primary-foreground text-primary text-sm font-semibold tap-highlight flex items-center gap-2">
                View Plans <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
