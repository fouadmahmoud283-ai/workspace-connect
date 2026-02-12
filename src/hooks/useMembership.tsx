import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  credits_per_month: number;
  features: string[];
  is_active: boolean;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  fawry_reference: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  plan?: MembershipPlan;
}

export const useMembership = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      return;
    }

    // Parse features from JSON
    const parsedPlans = data.map((plan: any) => ({
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
    }));

    setPlans(parsedPlans);
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("subscriptions")
      .select("*, plan:membership_plans(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription:", error);
      return;
    }

    if (data && data.plan) {
      data.plan.features = typeof data.plan.features === 'string' 
        ? JSON.parse(data.plan.features) 
        : data.plan.features;
    }

    setSubscription(data);
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchSubscription()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchPlans, fetchSubscription]);

  return { 
    plans, 
    subscription, 
    loading, 
    refetch: () => Promise.all([fetchPlans(), fetchSubscription()])
  };
};
