import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useMessages, Conversation, Message } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatScreenProps {
  conversation: Conversation;
  onBack: () => void;
}

export const ChatScreen = ({ conversation, onBack }: ChatScreenProps) => {
  const { user } = useAuth();
  const { sendMessage, getMessages, getConversationName } = useMessages();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const name = getConversationName(conversation);

  const loadMessages = async () => {
    const { data } = await getMessages(conversation.id);
    if (data) setMessages(data);
  };

  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async () => {
          await loadMessages();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversation.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || sending) return;

    setSending(true);
    setNewMessage("");
    await sendMessage(conversation.id, content);
    setSending(false);
    inputRef.current?.focus();
  };

  const otherMember = conversation.members?.find(m => m.user_id !== user?.id);
  const avatar = conversation.type === "direct" ? otherMember?.profile?.avatar_url : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b border-border safe-top bg-card">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-secondary tap-highlight">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        {avatar ? (
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">{name.charAt(0)}</span>
          </div>
        )}
        <div>
          <h2 className="font-semibold text-foreground">{name}</h2>
          {conversation.type === "group" && (
            <p className="text-xs text-muted-foreground">
              {conversation.members?.length} members
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[75%]", isMe ? "items-end" : "items-start")}>
                  {!isMe && conversation.type === "group" && (
                    <p className="text-xs text-muted-foreground mb-1 ml-1">
                      {msg.senderProfile?.full_name || "Unknown"}
                    </p>
                  )}
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border text-foreground rounded-bl-md"
                    )}
                  >
                    {msg.content}
                  </div>
                  <p className={cn("text-[10px] text-muted-foreground mt-1", isMe ? "text-right mr-1" : "ml-1")}>
                    {format(new Date(msg.created_at), "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-border safe-bottom bg-card">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className={cn(
              "p-3 rounded-full transition-colors tap-highlight",
              newMessage.trim()
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
