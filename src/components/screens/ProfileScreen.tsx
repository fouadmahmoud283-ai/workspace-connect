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
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: CreditCard, label: "Membership & Billing", description: "Pro Plan" },
  { icon: Calendar, label: "My Bookings", description: "3 upcoming" },
  { icon: Bell, label: "Notifications", description: "All enabled" },
  { icon: Shield, label: "Privacy & Security", description: "2FA enabled" },
  { icon: HelpCircle, label: "Help & Support", description: "FAQ, Contact" },
  { icon: Settings, label: "Settings", description: "App preferences" },
];

const stats = [
  { label: "Total Bookings", value: "47", icon: Calendar },
  { label: "Hours Worked", value: "186", icon: Clock },
  { label: "Member Since", value: "2024", icon: Star },
];

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/auth");
  };
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
                    src="https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200&h=200&fit=crop&crop=face"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-success border-2 border-card" />
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
                    Member
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
              key={item.label}
              className={cn(
                "flex items-center gap-4 w-full p-4 text-left tap-highlight hover:bg-secondary/50 transition-colors",
                index !== menuItems.length - 1 && "border-b border-border"
              )}
            >
              <div className="p-2.5 rounded-xl bg-secondary">
                <item.icon className="w-5 h-5 text-muted-foreground" />
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
    </div>
  );
};
