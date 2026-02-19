import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, CalendarDays, Users, MessageCircle, 
  LogOut, Search, X, Check, Trash2, Eye, ChevronDown, Building2, Edit2, Plus, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";

type Tab = "overview" | "bookings" | "users" | "workspaces" | "community";

interface Booking {
  id: string;
  user_id: string;
  space_id: string;
  space_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  credits_used: number;
  notes: string | null;
  created_at: string;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  membership_type: string;
  credits: number;
  created_at: string;
}

interface Space {
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

const tabs = [
  { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
  { id: "bookings" as Tab, label: "Bookings", icon: CalendarDays },
  { id: "workspaces" as Tab, label: "Workspaces", icon: Building2 },
  { id: "users" as Tab, label: "Users", icon: Users },
  { id: "community" as Tab, label: "Community", icon: MessageCircle },
];

export default function Admin() {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");

  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      setLoadingData(true);
      const [bookingsRes, usersRes, spacesRes] = await Promise.all([
        supabase.from("bookings").select("*").order("booking_date", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("spaces").select("*").order("created_at", { ascending: false }),
      ]);
      setBookings((bookingsRes.data as Booking[]) || []);
      setUsers((usersRes.data as Profile[]) || []);
      setSpaces((spacesRes.data as Space[]) || []);
      setLoadingData(false);
    };
    fetchData();
  }, [isAdmin]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const totalRevenue = bookings.reduce((sum, b) => sum + b.credits_used, 0);
  const activeUsers = users.length;

  const handleCancelBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled");
    }
  };

  const handleConfirmBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "confirmed" }).eq("id", id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed" } : b));
      toast.success("Booking confirmed");
    }
  };

  const handleCompleteBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "completed" }).eq("id", id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "completed" } : b));
      toast.success("Booking marked as completed");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== id));
      toast.success("Booking deleted");
    }
  };

  const getUserName = (userId: string) => {
    const u = users.find(u => u.user_id === userId);
    return u?.full_name || "Unknown User";
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.space_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getUserName(b.user_id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.membership_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (time: string) => {
    const [h] = time.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
  };

  const bookingStatusCounts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col p-4 shrink-0 hidden md:flex">
        <div className="flex items-center gap-3 mb-8 px-2">
          <img src={logo} alt="Backspace" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <h1 className="text-base font-bold text-foreground">Backspace</h1>
            <p className="text-[10px] text-primary font-medium uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all tap-highlight",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all tap-highlight"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-bottom">
        <div className="grid grid-cols-5 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] font-medium transition-all min-w-0",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-full px-0.5">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24 md:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 sm:px-6 py-3 sm:py-4 safe-top">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            {/* Mobile: show logo + title row */}
            <div className="flex items-center gap-3 md:hidden mb-1">
              <img src={logo} alt="Backspace" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xs text-primary font-semibold uppercase tracking-wider">Admin</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground capitalize">{activeTab}</h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                {activeTab === "overview" && "Dashboard summary"}
                {activeTab === "bookings" && `${bookings.length} total reservations`}
                {activeTab === "users" && `${users.length} registered users`}
                {activeTab === "workspaces" && `${spaces.length} workspaces`}
                {activeTab === "community" && "Manage community content"}
              </p>
            </div>
            {(activeTab === "bookings" || activeTab === "users" || activeTab === "workspaces") && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                />
              </div>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* Overview */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Bookings" value={bookings.length} />
                    <StatCard label="Active Bookings" value={confirmedBookings.length} accent />
                    <StatCard label="Total Credits Used" value={totalRevenue} />
                    <StatCard label="Registered Users" value={activeUsers} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Workspaces" value={spaces.length} />
                    <StatCard label="Available Spaces" value={spaces.filter(s => s.available).length} accent />
                    <StatCard label="Cancelled Bookings" value={bookingStatusCounts.cancelled} />
                    <StatCard label="Completed Bookings" value={bookingStatusCounts.completed} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-card border border-border p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Recent Bookings</h3>
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map((b) => (
                          <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <p className="text-sm font-medium text-foreground">{b.space_name}</p>
                              <p className="text-xs text-muted-foreground">{getUserName(b.user_id)} · {format(parseISO(b.booking_date), "MMM d")}</p>
                            </div>
                            <StatusBadge status={b.status} />
                          </div>
                        ))}
                        {bookings.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No bookings yet</p>}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-card border border-border p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Recent Users</h3>
                      <div className="space-y-3">
                        {users.slice(0, 5).map((u) => (
                          <div key={u.user_id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">{(u.full_name || "?")[0]}</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{u.full_name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{u.membership_type} · {u.credits} credits</p>
                            </div>
                          </div>
                        ))}
                        {users.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings */}
              {activeTab === "bookings" && (
                <div className="space-y-4">
                  {/* Status Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                    {(["all", "confirmed", "cancelled", "completed"] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setBookingStatusFilter(status)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all capitalize whitespace-nowrap shrink-0",
                          bookingStatusFilter === status
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {status} ({bookingStatusCounts[status]})
                      </button>
                    ))}
                  </div>

                  {filteredBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No bookings found</p>
                  ) : (
                    filteredBookings.map((b) => (
                      <div key={b.id} className="rounded-2xl bg-card border border-border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-foreground">{b.space_name}</h3>
                              <StatusBadge status={b.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getUserName(b.user_id)} · {format(parseISO(b.booking_date), "EEE, MMM d yyyy")} · {formatTime(b.start_time)} – {formatTime(b.end_time)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{b.credits_used} credits{b.notes ? ` · ${b.notes}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {b.status !== "confirmed" && b.status !== "completed" && (
                              <button onClick={() => handleConfirmBooking(b.id)} className="p-2 rounded-lg hover:bg-success/10 transition-colors" title="Confirm">
                                <Check className="w-4 h-4 text-success" />
                              </button>
                            )}
                            {b.status === "confirmed" && (
                              <>
                                <button onClick={() => handleCompleteBooking(b.id)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" title="Complete">
                                  <Check className="w-4 h-4 text-primary" />
                                </button>
                                <button onClick={() => handleCancelBooking(b.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Cancel">
                                  <X className="w-4 h-4 text-destructive" />
                                </button>
                              </>
                            )}
                            <button onClick={() => handleDeleteBooking(b.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Users */}
              {activeTab === "users" && (
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No users found</p>
                  ) : (
                    filteredUsers.map((u) => (
                      <div key={u.user_id} className="rounded-2xl bg-card border border-border p-4">
                        <div className="flex items-center gap-4">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-lg font-bold text-primary">{(u.full_name || "?")[0]}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground">{u.full_name || "Unknown"}</h3>
                            <p className="text-xs text-muted-foreground">{u.phone || "No phone"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{u.membership_type}</span>
                            <p className="text-xs text-muted-foreground mt-1">{u.credits} credits</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Workspaces */}
              {activeTab === "workspaces" && (
                <WorkspacesAdmin
                  spaces={spaces}
                  setSpaces={setSpaces}
                  searchQuery={searchQuery}
                />
              )}

              {/* Community */}
              {activeTab === "community" && (
                <CommunityAdmin />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "text-[10px] px-2 py-0.5 rounded-full font-medium",
      status === "confirmed" ? "bg-success/10 text-success" :
      status === "cancelled" ? "bg-destructive/10 text-destructive" :
      status === "completed" ? "bg-primary/10 text-primary" :
      "bg-muted text-muted-foreground"
    )}>{status}</span>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-3xl font-bold mt-1", accent ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}

// ============ WORKSPACES ADMIN ============

interface WorkspacesAdminProps {
  spaces: any[];
  setSpaces: React.Dispatch<React.SetStateAction<any[]>>;
  searchQuery: string;
}

function WorkspacesAdmin({ spaces, setSpaces, searchQuery }: WorkspacesAdminProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const filtered = spaces.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("spaces").delete().eq("id", id);
    if (!error) {
      setSpaces(prev => prev.filter(s => s.id !== id));
      toast.success("Workspace deleted");
    } else {
      toast.error("Failed to delete workspace");
    }
  };

  const handleToggleAvailability = async (id: string, available: boolean) => {
    const { error } = await supabase.from("spaces").update({ available: !available }).eq("id", id);
    if (!error) {
      setSpaces(prev => prev.map(s => s.id === id ? { ...s, available: !available } : s));
      toast.success(`Workspace ${!available ? "enabled" : "disabled"}`);
    }
  };

  const handleSave = async (data: any) => {
    if (editing) {
      const { error } = await supabase.from("spaces").update(data).eq("id", editing.id);
      if (!error) {
        setSpaces(prev => prev.map(s => s.id === editing.id ? { ...s, ...data } : s));
        toast.success("Workspace updated");
      } else {
        toast.error("Failed to update workspace");
      }
    } else {
      const { data: newSpace, error } = await supabase.from("spaces").insert(data).select().single();
      if (!error && newSpace) {
        setSpaces(prev => [newSpace, ...prev]);
        toast.success("Workspace created");
      } else {
        toast.error("Failed to create workspace");
      }
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Workspaces ({filtered.length})</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
            {spaces.filter(s => s.available).length} available
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
            {spaces.filter(s => !s.available).length} unavailable
          </span>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium tap-highlight w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Workspace
        </button>
      </div>

      {showForm && (
        <SpaceForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {filtered.map(s => (
        <div key={s.id} className="rounded-2xl bg-card border border-border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            {s.image && <img src={s.image} alt="" className="w-full sm:w-16 h-32 sm:h-16 rounded-xl object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="text-sm font-semibold text-foreground">{s.name}</h4>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  s.available ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {s.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{s.type} · {s.location} · Cap: {s.capacity} · {s.price}</p>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {(s.amenities || []).slice(0, 3).map((a: string) => (
                  <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{a}</span>
                ))}
                {(s.amenities || []).length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">+{s.amenities.length - 3}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
              <button
                onClick={() => handleToggleAvailability(s.id, s.available)}
                className={cn("p-2 rounded-lg transition-colors", s.available ? "hover:bg-destructive/10" : "hover:bg-success/10")}
                title={s.available ? "Disable" : "Enable"}
              >
                {s.available ? <X className="w-4 h-4 text-destructive" /> : <Check className="w-4 h-4 text-success" />}
              </button>
              <button onClick={() => { setEditing(s); setShowForm(true); }} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Edit">
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No workspaces found</p>
      )}
    </div>
  );
}

function SpaceForm({ initial, onSave, onCancel }: { initial: any | null; onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    type: initial?.type || "Meeting Room",
    capacity: initial?.capacity || 1,
    location: initial?.location || "",
    image: initial?.image || "",
    amenities: (initial?.amenities || []).join(", "),
    available: initial?.available ?? true,
    price: initial?.price || "",
    description: initial?.description || "",
    features: (initial?.features || []).join(", "),
    open_hours: initial?.open_hours || "8:00 AM - 10:00 PM",
  });

  const update = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    onSave({
      ...form,
      amenities: form.amenities.split(",").map(s => s.trim()).filter(Boolean),
      features: form.features.split(",").map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="rounded-2xl bg-card border border-primary/30 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{initial ? "Edit Workspace" : "New Workspace"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Name" value={form.name} onChange={v => update("name", v)} />
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Type</label>
          <select
            value={form.type}
            onChange={e => update("type", e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground outline-none"
          >
            <option value="Meeting Room">Meeting Room</option>
            <option value="Focus Pod">Focus Pod</option>
            <option value="Open Space">Open Space</option>
            <option value="Phone Booth">Phone Booth</option>
            <option value="Event Space">Event Space</option>
            <option value="Private Office">Private Office</option>
          </select>
        </div>
        <FormField label="Capacity" value={form.capacity} onChange={v => update("capacity", parseInt(v) || 1)} type="number" />
        <FormField label="Location" value={form.location} onChange={v => update("location", v)} />
        <FormField label="Price" value={form.price} onChange={v => update("price", v)} placeholder="e.g. $25/hr" />
        <FormField label="Open Hours" value={form.open_hours} onChange={v => update("open_hours", v)} />
        <FormField label="Image URL" value={form.image} onChange={v => update("image", v)} />
        <div className="flex items-center gap-2 self-end pb-1">
          <label className="text-xs text-muted-foreground">Available</label>
          <button
            onClick={() => update("available", !form.available)}
            className={cn("w-10 h-6 rounded-full transition-colors", form.available ? "bg-success" : "bg-muted")}
          >
            <div className={cn("w-4 h-4 rounded-full bg-foreground mx-1 transition-transform", form.available && "translate-x-4")} />
          </button>
        </div>
      </div>
      <FormField label="Amenities (comma separated)" value={form.amenities} onChange={v => update("amenities", v)} placeholder="Wifi, Monitor, Coffee" />
      <FormField label="Features (comma separated)" value={form.features} onChange={v => update("features", v)} placeholder="Whiteboard, Video conferencing" />
      <FormField label="Description" value={form.description} onChange={v => update("description", v)} textarea />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
        <button onClick={handleSubmit} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium tap-highlight">
          {initial ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}

// ============ COMMUNITY ADMIN ============

function CommunityAdmin() {
  const [subTab, setSubTab] = useState<"activities" | "experts" | "conversations">("activities");
  const [activities, setActivities] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [editingExpert, setEditingExpert] = useState<any | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showExpertForm, setShowExpertForm] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [a, e, c] = await Promise.all([
      supabase.from("student_activities").select("*").order("created_at", { ascending: false }),
      supabase.from("experts").select("*").order("created_at", { ascending: false }),
      supabase.from("conversations").select("*").order("updated_at", { ascending: false }),
    ]);
    setActivities(a.data || []);
    setExperts(e.data || []);
    setConversations(c.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDeleteActivity = async (id: string) => {
    await supabase.from("student_activities").delete().eq("id", id);
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.success("Activity deleted");
  };

  const handleDeleteExpert = async (id: string) => {
    await supabase.from("experts").delete().eq("id", id);
    setExperts(prev => prev.filter(e => e.id !== id));
    toast.success("Expert deleted");
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 rounded-xl bg-card border border-border w-fit">
        {(["activities", "experts", "conversations"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
            subTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      {subTab === "activities" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground">Student Activities ({activities.length})</h3>
            <button onClick={() => { setEditingActivity(null); setShowActivityForm(true); }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium tap-highlight">
              + Add Activity
            </button>
          </div>

          {showActivityForm && (
            <ActivityForm
              initial={editingActivity}
              onSave={async (data) => {
                if (editingActivity) {
                  await supabase.from("student_activities").update(data).eq("id", editingActivity.id);
                  toast.success("Activity updated");
                } else {
                  await supabase.from("student_activities").insert(data);
                  toast.success("Activity created");
                }
                setShowActivityForm(false);
                setEditingActivity(null);
                fetchAll();
              }}
              onCancel={() => { setShowActivityForm(false); setEditingActivity(null); }}
            />
          )}

          {activities.map(a => (
            <div key={a.id} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-4">
                {a.logo && <img src={a.logo} alt="" className="w-12 h-12 rounded-xl object-cover" />}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{a.name}</h4>
                  <p className="text-xs text-muted-foreground">{a.category} · {a.members} members · Founded {a.founded}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingActivity(a); setShowActivityForm(true); }} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDeleteActivity(a.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "experts" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground">Experts ({experts.length})</h3>
            <button onClick={() => { setEditingExpert(null); setShowExpertForm(true); }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium tap-highlight">
              + Add Expert
            </button>
          </div>

          {showExpertForm && (
            <ExpertForm
              initial={editingExpert}
              onSave={async (data) => {
                if (editingExpert) {
                  await supabase.from("experts").update(data).eq("id", editingExpert.id);
                  toast.success("Expert updated");
                } else {
                  await supabase.from("experts").insert(data);
                  toast.success("Expert created");
                }
                setShowExpertForm(false);
                setEditingExpert(null);
                fetchAll();
              }}
              onCancel={() => { setShowExpertForm(false); setEditingExpert(null); }}
            />
          )}

          {experts.map(e => (
            <div key={e.id} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-4">
                {e.avatar && <img src={e.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{e.name}</h4>
                  <p className="text-xs text-muted-foreground">{e.title} · {e.hourly_rate} · {e.sessions} sessions</p>
                  <div className="flex gap-1 mt-1">
                    {(e.expertise || []).map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={cn("text-[10px] px-2 py-1 rounded-full font-medium", e.is_available ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                    {e.is_available ? "Available" : "Unavailable"}
                  </span>
                  <button onClick={() => { setEditingExpert(e); setShowExpertForm(true); }} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDeleteExpert(e.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "conversations" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Conversations" value={conversations.length} />
            <StatCard label="Direct Messages" value={conversations.filter(c => c.type === "direct").length} />
            <StatCard label="Group Chats" value={conversations.filter(c => c.type === "group").length} accent />
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">All Conversations</h3>
            <div className="space-y-3">
              {conversations.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name || (c.type === "direct" ? "Direct Message" : "Group Chat")}</p>
                    <p className="text-xs text-muted-foreground">{c.type} · {format(parseISO(c.updated_at), "MMM d, HH:mm")}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">{c.type}</span>
                </div>
              ))}
              {conversations.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No conversations yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ FORMS ============

function ActivityForm({ initial, onSave, onCancel }: { initial: any | null; onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    category: initial?.category || "",
    members: initial?.members || 0,
    description: initial?.description || "",
    long_description: initial?.long_description || "",
    logo: initial?.logo || "",
    founded: initial?.founded || "",
    website: initial?.website || "",
    instagram: initial?.instagram || "",
    email: initial?.email || "",
  });

  const update = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="rounded-2xl bg-card border border-primary/30 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{initial ? "Edit Activity" : "New Activity"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Name" value={form.name} onChange={v => update("name", v)} />
        <FormField label="Category" value={form.category} onChange={v => update("category", v)} />
        <FormField label="Members" value={form.members} onChange={v => update("members", parseInt(v) || 0)} type="number" />
        <FormField label="Founded" value={form.founded} onChange={v => update("founded", v)} />
        <FormField label="Logo URL" value={form.logo} onChange={v => update("logo", v)} />
        <FormField label="Website" value={form.website} onChange={v => update("website", v)} />
        <FormField label="Instagram" value={form.instagram} onChange={v => update("instagram", v)} />
        <FormField label="Email" value={form.email} onChange={v => update("email", v)} />
      </div>
      <FormField label="Description" value={form.description} onChange={v => update("description", v)} />
      <FormField label="Long Description" value={form.long_description} onChange={v => update("long_description", v)} textarea />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
        <button onClick={() => onSave(form)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium tap-highlight">
          {initial ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}

function ExpertForm({ initial, onSave, onCancel }: { initial: any | null; onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    title: initial?.title || "",
    avatar: initial?.avatar || "",
    expertise: (initial?.expertise || []).join(", "),
    rating: initial?.rating || 0,
    sessions: initial?.sessions || 0,
    is_available: initial?.is_available ?? true,
    hourly_rate: initial?.hourly_rate || "",
    linkedin: initial?.linkedin || "",
    email: initial?.email || "",
  });

  const update = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="rounded-2xl bg-card border border-primary/30 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{initial ? "Edit Expert" : "New Expert"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Name" value={form.name} onChange={v => update("name", v)} />
        <FormField label="Title" value={form.title} onChange={v => update("title", v)} />
        <FormField label="Avatar URL" value={form.avatar} onChange={v => update("avatar", v)} />
        <FormField label="Expertise (comma separated)" value={form.expertise} onChange={v => update("expertise", v)} />
        <FormField label="Rating" value={form.rating} onChange={v => update("rating", parseFloat(v) || 0)} type="number" />
        <FormField label="Sessions" value={form.sessions} onChange={v => update("sessions", parseInt(v) || 0)} type="number" />
        <FormField label="Hourly Rate" value={form.hourly_rate} onChange={v => update("hourly_rate", v)} />
        <FormField label="LinkedIn" value={form.linkedin} onChange={v => update("linkedin", v)} />
        <FormField label="Email" value={form.email} onChange={v => update("email", v)} />
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Available</label>
          <button
            onClick={() => update("is_available", !form.is_available)}
            className={cn("w-10 h-6 rounded-full transition-colors", form.is_available ? "bg-success" : "bg-muted")}
          >
            <div className={cn("w-4 h-4 rounded-full bg-foreground mx-1 transition-transform", form.is_available && "translate-x-4")} />
          </button>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
        <button onClick={() => onSave({ ...form, expertise: form.expertise.split(",").map(s => s.trim()).filter(Boolean) })} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium tap-highlight">
          {initial ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", textarea, placeholder }: { label: string; value: any; onChange: (v: string) => void; type?: string; textarea?: boolean; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      )}
    </div>
  );
}
