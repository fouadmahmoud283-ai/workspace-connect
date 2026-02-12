import { useState } from "react";
import { 
  ArrowLeft, 
  Bell, 
  Mail, 
  Smartphone, 
  Calendar, 
  CreditCard, 
  Users, 
  Megaphone,
  Check,
  Trash2,
  Loader2 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen = ({ onBack }: NotificationsScreenProps) => {
  const { 
    notifications, 
    preferences, 
    unreadCount,
    loading, 
    updatePreferences, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();
  const { toast } = useToast();
  const [updatingPref, setUpdatingPref] = useState<string | null>(null);

  const handleToggle = async (key: keyof typeof preferences, value: boolean) => {
    if (!preferences) return;
    
    setUpdatingPref(key);
    const { error } = await updatePreferences({ [key]: value });
    setUpdatingPref(null);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllRead = async () => {
    const { error } = await markAllAsRead();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'success': return <Check className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success/20 text-success';
      case 'warning': return 'bg-warning/20 text-warning';
      case 'error': return 'bg-destructive/20 text-destructive';
      case 'booking': return 'bg-primary/20 text-primary';
      case 'payment': return 'bg-accent/20 text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const preferenceItems = preferences ? [
    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive updates via email', icon: Mail, value: preferences.email_notifications },
    { key: 'push_notifications', label: 'Push Notifications', description: 'Receive mobile push notifications', icon: Smartphone, value: preferences.push_notifications },
    { key: 'booking_reminders', label: 'Booking Reminders', description: 'Get reminded about upcoming bookings', icon: Calendar, value: preferences.booking_reminders },
    { key: 'payment_alerts', label: 'Payment Alerts', description: 'Notifications about payments and billing', icon: CreditCard, value: preferences.payment_alerts },
    { key: 'community_updates', label: 'Community Updates', description: 'News about events and community', icon: Users, value: preferences.community_updates },
    { key: 'marketing_emails', label: 'Marketing Emails', description: 'Promotional offers and updates', icon: Megaphone, value: preferences.marketing_emails },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-5 py-4 safe-top">
          <button onClick={onBack} className="p-2 -ml-2 tap-highlight">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
        </div>
      </div>

      <div className="px-5 mt-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="all">
              All {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="settings">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {unreadCount > 0 && (
              <div className="flex justify-end mb-4">
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  Mark all as read
                </Button>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all",
                      notification.is_read 
                        ? "bg-card border-border opacity-75" 
                        : "bg-card border-primary/30"
                    )}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-xl",
                        getNotificationColor(notification.type)
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={cn(
                            "font-medium text-foreground",
                            !notification.is_read && "font-semibold"
                          )}>
                            {notification.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              {preferenceItems.map((item, index) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-center gap-4 p-4",
                    index !== preferenceItems.length - 1 && "border-b border-border"
                  )}
                >
                  <div className="p-2.5 rounded-xl bg-secondary">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={item.value}
                    disabled={updatingPref === item.key}
                    onCheckedChange={(checked) => handleToggle(item.key as any, checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
