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

type Screen = 
  | { type: "home" }
  | { type: "spaces" }
  | { type: "space-detail"; space: typeof spacesData[0] }
  | { type: "community" }
  | { type: "activity-detail"; activity: typeof studentActivitiesData[0] }
  | { type: "expert-detail"; expert: typeof expertsData[0] }
  | { type: "profile" };

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
        return <ProfileScreen />;
      
      default:
        return <HomeScreen onNavigateToSpaces={() => handleTabChange("spaces")} />;
    }
  };

  // Hide bottom nav on detail screens
  const showBottomNav = !["space-detail", "activity-detail", "expert-detail"].includes(screen.type);

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      {showBottomNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  );
};

export default Index;