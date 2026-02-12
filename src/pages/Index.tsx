import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/navigation/BottomNav";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { SpacesScreen, spacesData } from "@/components/screens/SpacesScreen";
import { SpaceDetailScreen } from "@/components/screens/SpaceDetailScreen";
import { CommunityScreen, studentActivitiesData, expertsData } from "@/components/screens/CommunityScreen";
import { StudentActivityDetailScreen } from "@/components/screens/StudentActivityDetailScreen";
import { ExpertDetailScreen } from "@/components/screens/ExpertDetailScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { MembershipScreen } from "@/components/screens/MembershipScreen";
import { BookingsScreen } from "@/components/screens/BookingsScreen";
import { NotificationsScreen } from "@/components/screens/NotificationsScreen";
import { PrivacyScreen } from "@/components/screens/PrivacyScreen";
import { HelpScreen } from "@/components/screens/HelpScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { ChatListScreen } from "@/components/screens/ChatListScreen";
import { ChatScreen } from "@/components/screens/ChatScreen";
import { NewChatScreen } from "@/components/screens/NewChatScreen";
import { Conversation } from "@/hooks/useMessages";

type Screen = 
  | { type: "home" }
  | { type: "spaces" }
  | { type: "space-detail"; space: typeof spacesData[0] }
  | { type: "community" }
  | { type: "activity-detail"; activity: typeof studentActivitiesData[0] }
  | { type: "expert-detail"; expert: typeof expertsData[0] }
  | { type: "profile" }
  | { type: "membership" }
  | { type: "bookings" }
  | { type: "notifications" }
  | { type: "privacy" }
  | { type: "help" }
  | { type: "settings" }
  | { type: "chat-list" }
  | { type: "chat"; conversation: Conversation }
  | { type: "new-chat" };

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>({ type: "home" });
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        setScreen({ type: "home" });
        break;
      case "spaces":
        setScreen({ type: "spaces" });
        break;
      case "community":
        setScreen({ type: "community" });
        break;
      case "profile":
        setScreen({ type: "profile" });
        break;
    }
  };

  const handleProfileMenuClick = (menuItem: string) => {
    switch (menuItem) {
      case "membership":
        setScreen({ type: "membership" });
        break;
      case "bookings":
        setScreen({ type: "bookings" });
        break;
      case "notifications":
        setScreen({ type: "notifications" });
        break;
      case "privacy":
        setScreen({ type: "privacy" });
        break;
      case "help":
        setScreen({ type: "help" });
        break;
      case "settings":
        setScreen({ type: "settings" });
        break;
    }
  };

  const renderScreen = () => {
    switch (screen.type) {
      case "home":
        return <HomeScreen onNavigateToSpaces={() => handleTabChange("spaces")} />;
      
      case "spaces":
        return (
          <SpacesScreen
            onSelectSpace={(space) => setScreen({ type: "space-detail", space })}
          />
        );
      
      case "space-detail":
        return (
          <SpaceDetailScreen
            space={screen.space}
            onBack={() => setScreen({ type: "spaces" })}
          />
        );
      
      case "community":
        return (
          <CommunityScreen
            onSelectActivity={(activity) => setScreen({ type: "activity-detail", activity })}
            onSelectExpert={(expert) => setScreen({ type: "expert-detail", expert })}
            onOpenMessages={() => setScreen({ type: "chat-list" })}
          />
        );
      
      case "activity-detail":
        return (
          <StudentActivityDetailScreen
            activity={screen.activity}
            onBack={() => setScreen({ type: "community" })}
          />
        );
      
      case "expert-detail":
        return (
          <ExpertDetailScreen
            expert={screen.expert}
            onBack={() => setScreen({ type: "community" })}
          />
        );
      
      case "profile":
        return <ProfileScreen onMenuItemClick={handleProfileMenuClick} />;
      
      case "membership":
        return <MembershipScreen onBack={() => setScreen({ type: "profile" })} />;
      
      case "bookings":
        return <BookingsScreen onBack={() => setScreen({ type: "profile" })} />;
      
      case "notifications":
        return <NotificationsScreen onBack={() => setScreen({ type: "profile" })} />;
      
      case "privacy":
        return <PrivacyScreen onBack={() => setScreen({ type: "profile" })} />;
      
      case "help":
        return <HelpScreen onBack={() => setScreen({ type: "profile" })} />;
      
      case "settings":
        return <SettingsScreen onBack={() => setScreen({ type: "profile" })} />;
      
      case "chat-list":
        return (
          <ChatListScreen
            onBack={() => setScreen({ type: "community" })}
            onSelectConversation={(conv) => setScreen({ type: "chat", conversation: conv })}
            onNewChat={() => setScreen({ type: "new-chat" })}
          />
        );
      
      case "chat":
        return (
          <ChatScreen
            conversation={screen.conversation}
            onBack={() => setScreen({ type: "chat-list" })}
          />
        );
      
      case "new-chat":
        return (
          <NewChatScreen
            onBack={() => setScreen({ type: "chat-list" })}
            onConversationCreated={(conv) => setScreen({ type: "chat", conversation: conv as Conversation })}
          />
        );
      
      default:
        return <HomeScreen onNavigateToSpaces={() => handleTabChange("spaces")} />;
    }
  };

  // Hide bottom nav on detail screens
  const hideBottomNavScreens = [
    "space-detail", 
    "activity-detail", 
    "expert-detail",
    "membership",
    "bookings",
    "notifications",
    "privacy",
    "help",
    "settings",
    "chat-list",
    "chat",
    "new-chat"
  ];
  const showBottomNav = !hideBottomNavScreens.includes(screen.type);

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      {showBottomNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  );
};

export default Index;
