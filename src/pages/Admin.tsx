import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, CalendarDays, Users, MessageCircle, 
  LogOut, Search, X, Check, Trash2, Eye, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";

type Tab = "overview" | "bookings" | "users" | "community";

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

const tabs = [
  { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
  { id: "bookings" as Tab, label: "Bookings", icon: CalendarDays },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);

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
      const [bookingsRes, usersRes] = await Promise.all([
        supabase.from("bookings").select("*").order("booking_date", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);
      setBookings((bookingsRes.data as Booking[]) || []);
      setUsers((usersRes.data as Profile[]) || []);
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
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled");
    }
  };

  const handleConfirmBooking = async (id: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed" } : b));
      toast.success("Booking confirmed");
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

  const filteredBookings = bookings.filter(b =>
    b.space_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getUserName(b.user_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.membership_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (time: string) => {
    const [h] = time.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex safe-bottom">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24 md:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground capitalize">{activeTab}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeTab === "overview" && "Dashboard summary"}
                {activeTab === "bookings" && `${bookings.length} total reservations`}
                {activeTab === "users" && `${users.length} registered users`}
                {activeTab === "community" && "Manage community content"}
              </p>
            </div>
            {(activeTab === "bookings" || activeTab === "users") && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            )}
          </div>
        </header>

        <div className="p-6">
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Bookings */}
                    <div className="rounded-2xl bg-card border border-border p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Recent Bookings</h3>
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map((b) => (
                          <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <p className="text-sm font-medium text-foreground">{b.space_name}</p>
                              <p className="text-xs text-muted-foreground">{getUserName(b.user_id)} · {format(parseISO(b.booking_date), "MMM d")}</p>
                            </div>
                            <span className={cn(
                              "text-[10px] px-2 py-1 rounded-full font-medium",
                              b.status === "confirmed" ? "bg-success/10 text-success" :
                              b.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                              "bg-muted text-muted-foreground"
                            )}>{b.status}</span>
                          </div>
                        ))}
                        {bookings.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No bookings yet</p>}
                      </div>
                    </div>

                    {/* Recent Users */}
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
                <div className="space-y-3">
                  {filteredBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No bookings found</p>
                  ) : (
                    filteredBookings.map((b) => (
                      <div key={b.id} className="rounded-2xl bg-card border border-border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-foreground">{b.space_name}</h3>
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                                b.status === "confirmed" ? "bg-success/10 text-success" :
                                b.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                                "bg-muted text-muted-foreground"
                              )}>{b.status}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getUserName(b.user_id)} · {format(parseISO(b.booking_date), "EEE, MMM d yyyy")} · {formatTime(b.start_time)} – {formatTime(b.end_time)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{b.credits_used} credits{b.notes ? ` · ${b.notes}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {b.status !== "confirmed" && (
                              <button onClick={() => handleConfirmBooking(b.id)} className="p-2 rounded-lg hover:bg-success/10 transition-colors" title="Confirm">
                                <Check className="w-4 h-4 text-success" />
                              </button>
                            )}
                            {b.status === "confirmed" && (
                              <button onClick={() => handleCancelBooking(b.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Cancel">
                                <X className="w-4 h-4 text-destructive" />
                              </button>
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

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-3xl font-bold mt-1", accent ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}

function CommunityAdmin() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false });
      setConversations(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Conversations" value={conversations.length} />
        <StatCard label="Direct Messages" value={conversations.filter(c => c.type === "direct").length} />
        <StatCard label="Group Chats" value={conversations.filter(c => c.type === "group").length} accent />
      </div>

      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">All Conversations</h3>
        <div className="space-y-3">
          {conversations.map((c) => (
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
  );
}
