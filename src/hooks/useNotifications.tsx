import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  booking_reminders: boolean;
  payment_alerts: boolean;
  community_updates: boolean;
  marketing_emails: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }

    setNotifications(data || []);
  }, [user]);

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      return;
    }

    let { data, error } = await (supabase as any)
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Create default preferences if none exist
    if (!data && !error) {
      const { data: newPrefs, error: insertError } = await (supabase as any)
        .from("notification_preferences")
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (!insertError) {
        data = newPrefs;
      }
    }

    if (error) {
      console.error("Error fetching preferences:", error);
      return;
    }

    setPreferences(data);
  }, [user]);

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return { error: new Error("Not authenticated") };

    const { data, error } = await (supabase as any)
      .from("notification_preferences")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (!error) {
      setPreferences(data);
    }

    return { data, error };
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (!error) {
      await fetchNotifications();
    }

    return { error };
  };

  const markAllAsRead = async () => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (!error) {
      await fetchNotifications();
    }

    return { error };
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await (supabase as any)
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (!error) {
      await fetchNotifications();
    }

    return { error };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchNotifications(), fetchPreferences()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchNotifications, fetchPreferences]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { 
    notifications, 
    preferences, 
    unreadCount,
    loading, 
    updatePreferences, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    refetch: () => Promise.all([fetchNotifications(), fetchPreferences()])
  };
};
