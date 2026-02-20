import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token to get their identity
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, otherUserId, name, memberIds } = await req.json();

    // Use service role client to bypass RLS
    const adminClient = createClient(supabaseUrl, supabaseKey);

    if (type === "direct") {
      // Check if DM already exists between these two users
      const { data: myConvs } = await adminClient
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (myConvs) {
        for (const mc of myConvs) {
          const { data: conv } = await adminClient
            .from("conversations")
            .select("*")
            .eq("id", mc.conversation_id)
            .eq("type", "direct")
            .single();

          if (conv) {
            const { data: otherMember } = await adminClient
              .from("conversation_members")
              .select("user_id")
              .eq("conversation_id", conv.id)
              .eq("user_id", otherUserId)
              .single();

            if (otherMember) {
              return new Response(JSON.stringify({ data: conv }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
          }
        }
      }

      // Create new direct conversation
      const { data: newConv, error: convError } = await adminClient
        .from("conversations")
        .insert({ type: "direct", created_by: user.id })
        .select()
        .single();

      if (convError) {
        return new Response(JSON.stringify({ error: convError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Add both members
      await adminClient.from("conversation_members").insert([
        { conversation_id: newConv.id, user_id: user.id },
        { conversation_id: newConv.id, user_id: otherUserId },
      ]);

      return new Response(JSON.stringify({ data: newConv }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (type === "group") {
      const { data: newConv, error: convError } = await adminClient
        .from("conversations")
        .insert({ type: "group", name, created_by: user.id })
        .select()
        .single();

      if (convError) {
        return new Response(JSON.stringify({ error: convError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const allMembers = [user.id, ...(memberIds || []).filter((id: string) => id !== user.id)];
      await adminClient.from("conversation_members").insert(
        allMembers.map((uid: string) => ({ conversation_id: newConv.id, user_id: uid }))
      );

      return new Response(JSON.stringify({ data: newConv }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
