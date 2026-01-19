import { useState } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { SpacesScreen } from "@/components/screens/SpacesScreen";
import { CommunityScreen } from "@/components/screens/CommunityScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onNavigateToSpaces={() => setActiveTab("spaces")} />;
      case "spaces":
        return <SpacesScreen />;
      case "community":
        return <CommunityScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigateToSpaces={() => setActiveTab("spaces")} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
