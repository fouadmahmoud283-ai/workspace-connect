import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkBookingConflict = async (
    spaceId: string,
    bookingDate: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await (supabase as any)
        .from("bookings")
        .select("start_time, end_time")
        .eq("space_id", spaceId)
        .eq("booking_date", bookingDate)
        .eq("status", "confirmed");

      if (error) throw error;

      if (!data || data.length === 0) return false;

      const newStart = parseInt(startTime.split(":")[0]);
      const newEnd = parseInt(endTime.split(":")[0]);

      return data.some((booking) => {
        const existingStart = parseInt(booking.start_time.split(":")[0]);
        const existingEnd = parseInt(booking.end_time.split(":")[0]);
        return newStart < existingEnd && newEnd > existingStart;
      });
    } catch (error) {
      console.error("Error checking booking conflict:", error);
      return false;
    }
  };

  const createBooking = async (booking: Omit<Booking, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await (supabase as any)
      .from("bookings")
      .insert({ ...booking, user_id: user.id })
      .select()
      .single();

    if (!error) {
      await fetchBookings();
    }

    return { data, error };
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await (supabase as any)
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (!error) {
      await fetchBookings();
    }

    return { error };
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const upcomingBookings = bookings.filter(
    b => b.status === 'confirmed' && new Date(b.booking_date) >= new Date(new Date().toDateString())
  );

  const pastBookings = bookings.filter(
    b => b.status === 'completed' || new Date(b.booking_date) < new Date(new Date().toDateString())
  );

  return { 
    bookings, 
    upcomingBookings, 
    pastBookings, 
    loading, 
    createBooking, 
    cancelBooking,
    checkBookingConflict,
    refetch: fetchBookings 
  };
};
