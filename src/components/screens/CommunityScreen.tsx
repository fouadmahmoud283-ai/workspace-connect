import { useState, useEffect } from "react";
import { Search, Users, GraduationCap, Award, MessageCircle } from "lucide-react";
import { MemberCard } from "@/components/community/MemberCard";
import { StudentActivityCard } from "@/components/community/StudentActivityCard";
import { ExpertCard } from "@/components/community/ExpertCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMessages, Conversation } from "@/hooks/useMessages";
import { toast } from "sonner";

const tabs = [
  { id: "members", label: "Members", icon: Users },
  { id: "activities", label: "Activities", icon: GraduationCap },
  { id: "experts", label: "Experts", icon: Award },
];

interface CommunityMember {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface DBActivity {
  id: string;
  name: string;
  logo: string | null;
  category: string;
  members: number;
  description: string;
  long_description: string | null;
  founded: string | null;
  website: string | null;
  instagram: string | null;
  email: string | null;
}

interface DBExpert {
  id: string;
  name: string;
  avatar: string | null;
  title: string;
  expertise: string[];
  rating: number;
  sessions: number;
  is_available: boolean;
  hourly_rate: string | null;
  linkedin: string | null;
  email: string | null;
}

// Map DB activity to component props
const mapActivity = (a: DBActivity) => ({
  id: a.id,
  name: a.name,
  logo: a.logo || "",
  category: a.category,
  members: a.members,
  description: a.description,
  longDescription: a.long_description || undefined,
  founded: a.founded || undefined,
  website: a.website || undefined,
  instagram: a.instagram || undefined,
  email: a.email || undefined,
});

// Map DB expert to component props
const mapExpert = (e: DBExpert) => ({
  id: e.id,
  name: e.name,
  avatar: e.avatar || "",
  title: e.title,
  expertise: e.expertise,
  rating: e.rating,
  sessions: e.sessions,
  isAvailable: e.is_available,
  hourlyRate: e.hourly_rate || undefined,
  linkedin: e.linkedin || undefined,
  email: e.email || undefined,
});

interface CommunityScreenProps {
  onSelectActivity?: (activity: ReturnType<typeof mapActivity>) => void;
  onSelectExpert?: (expert: ReturnType<typeof mapExpert>) => void;
  onOpenMessages?: () => void;
  onOpenChat?: (conversation: Conversation) => void;
}

export const CommunityScreen = ({ onSelectActivity, onSelectExpert, onOpenMessages, onOpenChat }: CommunityScreenProps) => {
  const { user } = useAuth();
  const { createDirectConversation } = useMessages();
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [activities, setActivities] = useState<DBActivity[]>([]);
  const [experts, setExperts] = useState<DBExpert[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [membersRes, activitiesRes, expertsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, avatar_url").neq("user_id", user?.id || ""),
        supabase.from("student_activities").select("*").order("name"),
        supabase.from("experts").select("*").order("name"),
      ]);
      setMembers(membersRes.data || []);
      setActivities((activitiesRes.data as DBActivity[]) || []);
      setExperts((expertsRes.data as DBExpert[]) || []);
      setLoadingMembers(false);
    };
    fetchAll();
  }, [user]);

  const handleMessage = async (userId: string) => {
    const { data, error } = await createDirectConversation(userId);
    if (error) {
      toast.error("Failed to start conversation");
    } else if (data && onOpenChat) {
      onOpenChat(data as Conversation);
    }
  };

  const handleActivityClick = (id: string) => {
    const activity = activities.find((a) => a.id === id);
    if (activity && onSelectActivity) onSelectActivity(mapActivity(activity));
  };

  const handleExpertClick = (id: string) => {
    const expert = experts.find((e) => e.id === id);
    if (expert && onSelectExpert) onSelectExpert(mapExpert(expert));
  };

  const filteredMembers = members.filter((m) =>
    (m.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activities.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExperts = experts.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mappedActivities = filteredActivities.map(mapActivity);
  const mappedExperts = filteredExperts.map(mapExpert);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground mt-1">
              <span className="text-success font-medium">{members.length} members</span> · Connect & grow
            </p>
          </div>
          {onOpenMessages && (
            <button onClick={onOpenMessages} className="p-3 rounded-full bg-primary/10 tap-highlight">
              <MessageCircle className="w-5 h-5 text-primary" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 p-1 rounded-xl bg-card border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 tap-highlight",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {activeTab === "members" && (
          <div className="space-y-3">
            {loadingMembers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No members found</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <MemberCard
                  key={member.user_id}
                  id={member.user_id}
                  name={member.full_name || "Unknown"}
                  role=""
                  company=""
                  avatar={member.avatar_url || ""}
                  skills={[]}
                  isOnline={false}
                  onConnect={() => handleMessage(member.user_id)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "activities" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">Student activities partnered with Backspace</p>
            {mappedActivities.map((activity, index) => (
              <div key={activity.id} style={{ animationDelay: `${index * 100}ms` }}>
                <StudentActivityCard
                  id={activity.id}
                  name={activity.name}
                  logo={activity.logo}
                  category={activity.category}
                  members={activity.members}
                  description={activity.description}
                  onClick={handleActivityClick}
                />
              </div>
            ))}
            {mappedActivities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No activities found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "experts" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">Book sessions with industry experts</p>
            {mappedExperts.map((expert, index) => (
              <div key={expert.id} style={{ animationDelay: `${index * 100}ms` }}>
                <ExpertCard
                  id={expert.id}
                  name={expert.name}
                  avatar={expert.avatar}
                  title={expert.title}
                  expertise={expert.expertise}
                  rating={expert.rating}
                  sessions={expert.sessions}
                  isAvailable={expert.isAvailable}
                  onClick={handleExpertClick}
                />
              </div>
            ))}
            {mappedExperts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No experts found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
