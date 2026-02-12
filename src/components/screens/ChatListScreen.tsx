import { ArrowLeft, MessageCircle, Plus, Users } from "lucide-react";
import { useMessages, Conversation } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ChatListScreenProps {
  onBack: () => void;
  onSelectConversation: (conv: Conversation) => void;
  onNewChat: () => void;
}

export const ChatListScreen = ({ onBack, onSelectConversation, onNewChat }: ChatListScreenProps) => {
  const { conversations, loading, getConversationName } = useMessages();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-14 pb-4 safe-top flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-secondary tap-highlight">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground text-sm">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="p-3 rounded-full bg-primary text-primary-foreground tap-highlight"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No messages yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Start a conversation with a community member</p>
            <button
              onClick={onNewChat}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold tap-highlight"
            >
              Start a Chat
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const name = getConversationName(conv);
              const otherMember = conv.members?.find(m => m.user_id !== user?.id);
              const avatar = conv.type === "direct"
                ? otherMember?.profile?.avatar_url
                : null;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-card transition-colors tap-highlight text-left"
                >
                  <div className="relative flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {conv.type === "group" ? (
                          <Users className="w-5 h-5 text-primary" />
                        ) : (
                          <span className="text-primary font-bold text-lg">{name.charAt(0)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate">{name}</span>
                      {conv.lastMessage && (
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
