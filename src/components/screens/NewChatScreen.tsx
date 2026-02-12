import { useState, useEffect } from "react";
import { ArrowLeft, Search, MessageCircle, Users, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMessages, Conversation } from "@/hooks/useMessages";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewChatScreenProps {
  onBack: () => void;
  onConversationCreated: (conv: Conversation) => void;
}

interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const NewChatScreen = ({ onBack, onConversationCreated }: NewChatScreenProps) => {
  const { user } = useAuth();
  const { createDirectConversation, createGroupConversation } = useMessages();
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .neq("user_id", user?.id || "");
      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = async (userId: string) => {
    if (mode === "direct") {
      const { data, error } = await createDirectConversation(userId);
      if (error) {
        toast.error("Failed to create conversation");
      } else if (data) {
        onConversationCreated(data as Conversation);
      }
    } else {
      setSelectedUsers(prev =>
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
    }
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2) {
      toast.error("Select at least 2 members for a group");
      return;
    }
    if (!groupName.trim()) {
      toast.error("Enter a group name");
      return;
    }

    const { data, error } = await createGroupConversation(groupName, selectedUsers);
    if (error) {
      toast.error("Failed to create group");
    } else if (data) {
      onConversationCreated(data as Conversation);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-4 safe-top flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-secondary tap-highlight">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">New Chat</h1>
      </div>

      {/* Mode toggle */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 p-1 rounded-xl bg-card border border-border">
          <button
            onClick={() => { setMode("direct"); setSelectedUsers([]); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all tap-highlight",
              mode === "direct" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Direct
          </button>
          <button
            onClick={() => setMode("group")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all tap-highlight",
              mode === "group" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            Group
          </button>
        </div>
      </div>

      {/* Group name input */}
      {mode === "group" && (
        <div className="px-5 mb-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name..."
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
        </div>
      )}

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
        </div>
      </div>

      {/* User list */}
      <div className="px-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No members found</p>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((u) => {
              const isSelected = selectedUsers.includes(u.user_id);
              return (
                <button
                  key={u.user_id}
                  onClick={() => handleSelectUser(u.user_id)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-card transition-colors tap-highlight text-left"
                >
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">{(u.full_name || "?").charAt(0)}</span>
                    </div>
                  )}
                  <span className="flex-1 font-medium text-foreground">{u.full_name || "Unknown"}</span>
                  {mode === "group" && isSelected && (
                    <div className="p-1 rounded-full bg-primary">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Group create button */}
      {mode === "group" && selectedUsers.length >= 2 && (
        <div className="fixed bottom-8 left-5 right-5 safe-bottom">
          <button
            onClick={handleCreateGroup}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold tap-highlight"
          >
            Create Group ({selectedUsers.length} members)
          </button>
        </div>
      )}
    </div>
  );
};
