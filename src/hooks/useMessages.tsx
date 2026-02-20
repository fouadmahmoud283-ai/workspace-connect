import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: ConversationMember[];
  lastMessage?: Message | null;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  senderProfile?: { full_name: string | null; avatar_url: string | null } | null;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) { setConversations([]); setLoading(false); return; }

    try {
      // Get conversations the user is a member of
      const { data: memberRows } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (!memberRows || memberRows.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const convIds = memberRows.map(m => m.conversation_id);

      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .order("updated_at", { ascending: false });

      if (!convos) { setConversations([]); setLoading(false); return; }

      // Fetch members + profiles for each conversation
      const { data: allMembers } = await supabase
        .from("conversation_members")
        .select("*")
        .in("conversation_id", convIds);

      const memberUserIds = [...new Set((allMembers || []).map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", memberUserIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      // Fetch last message per conversation
      const enriched: Conversation[] = [];
      for (const c of convos) {
        const members = (allMembers || [])
          .filter(m => m.conversation_id === c.id)
          .map(m => ({ ...m, profile: profileMap.get(m.user_id) || null }));

        const { data: lastMsgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMessage = lastMsgs && lastMsgs.length > 0 ? lastMsgs[0] : null;

        enriched.push({ ...c, type: c.type as "direct" | "group", members, lastMessage });
      }

      setConversations(enriched);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const getConversationName = (conv: Conversation): string => {
    if (conv.name) return conv.name;
    if (conv.type === "direct" && conv.members) {
      const other = conv.members.find(m => m.user_id !== user?.id);
      return other?.profile?.full_name || "Unknown";
    }
    return "Group Chat";
  };

  const createDirectConversation = async (otherUserId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("create-conversation", {
        body: { type: "direct", otherUserId },
      });

      if (response.error) return { data: null, error: response.error };
      
      await fetchConversations();
      return { data: response.data?.data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const createGroupConversation = async (name: string, memberIds: string[]) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const response = await supabase.functions.invoke("create-conversation", {
        body: { type: "group", name, memberIds },
      });

      if (response.error) return { data: null, error: response.error };
      
      await fetchConversations();
      return { data: response.data?.data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content })
      .select()
      .single();

    // Update conversation updated_at
    if (!error) {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }

    return { data, error };
  };

  const getMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", senderIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      return {
        data: data.map(m => ({ ...m, senderProfile: profileMap.get(m.sender_id) || null })),
        error: null,
      };
    }

    return { data: [], error };
  };

  return {
    conversations,
    loading,
    getConversationName,
    createDirectConversation,
    createGroupConversation,
    sendMessage,
    getMessages,
    refetch: fetchConversations,
  };
};
