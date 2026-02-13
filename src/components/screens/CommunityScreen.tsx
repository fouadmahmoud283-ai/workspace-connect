import { useState } from "react";
import { Search, Users, GraduationCap, Award, MessageCircle } from "lucide-react";
import { MemberCard } from "@/components/community/MemberCard";
import { StudentActivityCard } from "@/components/community/StudentActivityCard";
import { ExpertCard } from "@/components/community/ExpertCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tabs = [
  { id: "members", label: "Members", icon: Users },
  { id: "activities", label: "Activities", icon: GraduationCap },
  { id: "experts", label: "Experts", icon: Award },
];

const membersData = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "UX Designer",
    company: "Creative Labs",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    skills: ["UI/UX", "Figma", "Research"],
    isOnline: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Full Stack Developer",
    company: "TechFlow Inc.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    skills: ["React", "Node.js", "TypeScript"],
    isOnline: true,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    company: "GrowthHQ",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    skills: ["SEO", "Content", "Analytics"],
    isOnline: false,
  },
];

export const studentActivitiesData = [
  {
    id: "sa1",
    name: "Tech Innovators Club",
    logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop",
    category: "Technology",
    members: 156,
    description: "A community of tech enthusiasts building the future together.",
    longDescription: "Tech Innovators Club is a vibrant community of students and young professionals passionate about technology and innovation. We organize hackathons, coding workshops, and tech talks with industry leaders.",
    founded: "2020",
    website: "https://techinnovators.club",
    instagram: "https://instagram.com/techinnovators",
    email: "hello@techinnovators.club",
  },
  {
    id: "sa2",
    name: "Entrepreneurship Society",
    logo: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop",
    category: "Business",
    members: 234,
    description: "Empowering the next generation of entrepreneurs and startups.",
    longDescription: "The Entrepreneurship Society connects aspiring founders with mentors, investors, and resources. We host pitch competitions, startup workshops, and networking events.",
    founded: "2018",
    email: "contact@esociety.org",
  },
  {
    id: "sa3",
    name: "Design Collective",
    logo: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=200&h=200&fit=crop",
    category: "Design",
    members: 89,
    description: "Where creativity meets purpose. Designers shaping tomorrow.",
    longDescription: "Design Collective brings together graphic designers, UI/UX specialists, and creative minds. We collaborate on projects, share resources, and host design critiques and exhibitions.",
    founded: "2021",
    instagram: "https://instagram.com/designcollective",
  },
  {
    id: "sa4",
    name: "Green Campus Initiative",
    logo: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200&h=200&fit=crop",
    category: "Sustainability",
    members: 178,
    description: "Making our campus and community more sustainable.",
    longDescription: "Green Campus Initiative focuses on environmental sustainability through awareness campaigns, recycling programs, and green technology adoption.",
    founded: "2019",
    website: "https://greencampus.org",
    email: "green@campus.org",
  },
];

export const expertsData = [
  {
    id: "ex1",
    name: "Dr. Amanda Foster",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    title: "Startup Advisor & Investor",
    expertise: ["Fundraising", "Strategy", "Scaling"],
    rating: 4.9,
    sessions: 234,
    isAvailable: true,
    hourlyRate: "$150/hr",
    linkedin: "https://linkedin.com/in/amandafoster",
    email: "amanda@example.com",
  },
  {
    id: "ex2",
    name: "James Mitchell",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    title: "Senior Product Manager",
    expertise: ["Product Strategy", "Agile", "User Research"],
    rating: 4.8,
    sessions: 156,
    isAvailable: true,
    hourlyRate: "$100/hr",
    email: "james@example.com",
  },
  {
    id: "ex3",
    name: "Dr. Lisa Chen",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    title: "AI/ML Researcher",
    expertise: ["Machine Learning", "Data Science", "Python"],
    rating: 4.95,
    sessions: 89,
    isAvailable: false,
    hourlyRate: "$200/hr",
    linkedin: "https://linkedin.com/in/lisachen",
  },
  {
    id: "ex4",
    name: "Robert Williams",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
    title: "Marketing Director",
    expertise: ["Brand Strategy", "Growth Hacking", "Digital Marketing"],
    rating: 4.7,
    sessions: 312,
    isAvailable: true,
    hourlyRate: "$85/hr",
    email: "robert@example.com",
  },
];

interface CommunityScreenProps {
  onSelectActivity?: (activity: typeof studentActivitiesData[0]) => void;
  onSelectExpert?: (expert: typeof expertsData[0]) => void;
  onOpenMessages?: () => void;
}

export const CommunityScreen = ({ onSelectActivity, onSelectExpert, onOpenMessages }: CommunityScreenProps) => {
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");

  const onlineCount = membersData.filter((m) => m.isOnline).length;

  const handleConnect = (id: string) => {
    const member = membersData.find((m) => m.id === id);
    toast.success(`Connection request sent to ${member?.name}!`);
  };

  const handleActivityClick = (id: string) => {
    const activity = studentActivitiesData.find((a) => a.id === id);
    if (activity && onSelectActivity) {
      onSelectActivity(activity);
    }
  };

  const handleExpertClick = (id: string) => {
    const expert = expertsData.find((e) => e.id === id);
    if (expert && onSelectExpert) {
      onSelectExpert(expert);
    }
  };

  const filteredMembers = membersData.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = studentActivitiesData.filter((activity) =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExperts = expertsData.filter((expert) =>
    expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expert.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground mt-1">
              <span className="text-success font-medium">{onlineCount} online</span> · Connect & grow
            </p>
          </div>
          {onOpenMessages && (
            <button
              onClick={onOpenMessages}
              className="p-3 rounded-full bg-primary/10 tap-highlight"
            >
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
        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {filteredMembers.map((member, index) => (
              <div key={member.id} style={{ animationDelay: `${index * 100}ms` }}>
                <MemberCard {...member} onConnect={handleConnect} />
              </div>
            ))}
          </div>
        )}
        
        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Student activities partnered with Backspace
            </p>
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} style={{ animationDelay: `${index * 100}ms` }}>
                <StudentActivityCard {...activity} onClick={handleActivityClick} />
              </div>
            ))}
          </div>
        )}
        
        {/* Experts Tab */}
        {activeTab === "experts" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Book sessions with industry experts
            </p>
            {filteredExperts.map((expert, index) => (
              <div key={expert.id} style={{ animationDelay: `${index * 100}ms` }}>
                <ExpertCard {...expert} onClick={handleExpertClick} />
              </div>
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {((activeTab === "members" && filteredMembers.length === 0) ||
          (activeTab === "activities" && filteredActivities.length === 0) ||
          (activeTab === "experts" && filteredExperts.length === 0)) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No results found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};