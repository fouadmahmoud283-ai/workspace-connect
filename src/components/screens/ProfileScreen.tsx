import { useState } from "react";
import { 
  Settings, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Calendar,
  Clock,
  Star,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useBookings } from "@/hooks/useBookings";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

interface ProfileScreenProps {
  onMenuItemClick?: (menuItem: string) => void;
}

export const ProfileScreen = ({ onMenuItemClick }: ProfileScreenProps) => {
  const { user, signOut } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile();
  const { upcomingBookings } = useBookings();
  const { preferences, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/auth");
  };

  const handleMenuClick = (key: string) => {
    if (onMenuItemClick) {
      onMenuItemClick(key);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200&h=200&fit=crop&crop=face";

  // Dynamic descriptions based on real data
  const notificationStatus = preferences 
    ? (preferences.email_notifications && preferences.push_notifications ? 'All enabled' : 'Partially enabled')
    : 'Loading...';

  const menuItems = [
    { 
      key: "membership",
      icon: CreditCard, 
      label: "Membership & Billing", 
      description: profile?.membership_type ? `${profile.membership_type.charAt(0).toUpperCase() + profile.membership_type.slice(1)} Plan` : "Basic Plan"
    },
    { 
      key: "bookings",
      icon: Calendar, 
      label: "My Bookings", 
      description: `${upcomingBookings.length} upcoming`
    },
    { 
      key: "notifications",
      icon: Bell, 
      label: "Notifications", 
      description: unreadCount > 0 ? `${unreadCount} unread` : notificationStatus,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { 
      key: "privacy",
      icon: Shield, 
      label: "Privacy & Security", 
      description: "Manage your security"
    },
    { 
      key: "help",
      icon: HelpCircle, 
      label: "Help & Support", 
      description: "FAQ, Contact"
    },
    { 
      key: "settings",
      icon: Settings, 
      label: "Settings", 
      description: "App preferences"
    },
  ];

  const stats = [
    { label: "Credits", value: profile?.credits?.toString() || "0", icon: Calendar },
    { label: "Plan", value: profile?.membership_type?.charAt(0).toUpperCase() + (profile?.membership_type?.slice(1) || 'asic'), icon: Clock },
    { label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : "2024", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="h-32 bg-gradient-glow" />
        
        {/* Profile Card */}
        <div className="px-5 -mt-16 safe-top">
          <div className="p-5 rounded-2xl bg-card border border-border animate-fade-in">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/20">
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-success border-2 border-card" />
              </div>
              
              {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground truncate">
                      {displayName}
                    </h2>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
                    {profile?.membership_type ? `${profile.membership_type.charAt(0).toUpperCase() + profile.membership_type.slice(1)}` : 'Basic'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu */}
      <div className="px-5 mt-6">
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item.key)}
              className={cn(
                "flex items-center gap-4 w-full p-4 text-left tap-highlight hover:bg-secondary/50 transition-colors",
                index !== menuItems.length - 1 && "border-b border-border"
              )}
            >
              <div className="p-2.5 rounded-xl bg-secondary relative">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
      
      {/* Logout */}
      <div className="px-5 mt-6">
        <button 
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-destructive/10 text-destructive font-medium tap-highlight hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
      
      {/* Version */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        Backspace v1.0.0
      </p>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          userId={user.id}
          currentName={displayName}
          currentAvatarUrl={profile?.avatar_url || null}
          onProfileUpdated={refetchProfile}
        />
      )}
    </div>
  );
};
