import { useState } from "react";
import { Search, Filter, UserPlus } from "lucide-react";
import { MemberCard } from "@/components/community/MemberCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const skillFilters = ["All", "Design", "Development", "Marketing", "Finance", "Startup"];

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
  {
    id: "4",
    name: "David Kim",
    role: "Startup Founder",
    company: "NexGen AI",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    skills: ["Strategy", "AI/ML", "Leadership"],
    isOnline: true,
  },
  {
    id: "5",
    name: "Lisa Wang",
    role: "Product Designer",
    company: "Pixel Perfect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    skills: ["Branding", "Motion", "3D"],
    isOnline: false,
  },
];

export const CommunityScreen = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = membersData.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "All") return matchesSearch;
    
    // Check if any skill matches the filter
    const matchesFilter = member.skills.some((skill) =>
      skill.toLowerCase().includes(activeFilter.toLowerCase())
    );
    
    return matchesSearch && matchesFilter;
  });

  const onlineCount = membersData.filter((m) => m.isOnline).length;

  const handleConnect = (id: string) => {
    const member = membersData.find((m) => m.id === id);
    toast.success(`Connection request sent to ${member?.name}!`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground mt-1">
              <span className="text-success font-medium">{onlineCount} online</span> · {membersData.length} members
            </p>
          </div>
          <button className="p-3 rounded-xl bg-primary text-primary-foreground tap-highlight">
            <UserPlus className="w-5 h-5" />
          </button>
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
            placeholder="Search members, skills..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>
      
      {/* Skill Filter */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {skillFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 tap-highlight",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      {/* Members List */}
      <div className="px-5">
        <div className="space-y-3">
          {filteredMembers.map((member, index) => (
            <div
              key={member.id}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MemberCard {...member} onConnect={handleConnect} />
            </div>
          ))}
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No members found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
