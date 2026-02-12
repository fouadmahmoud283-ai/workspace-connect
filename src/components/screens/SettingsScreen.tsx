import { useState } from "react";
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Globe, 
  Palette,
  Volume2,
  Vibrate,
  RefreshCw,
  Info
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { toast } = useToast();
  
  // Settings state (would be persisted in real app)
  const [settings, setSettings] = useState({
    darkMode: true,
    language: "en",
    soundEffects: true,
    hapticFeedback: true,
    autoRefresh: true,
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting Updated",
      description: "Your preference has been saved"
    });
  };

  const toggleItems = [
    { 
      icon: settings.darkMode ? Moon : Sun, 
      label: "Dark Mode", 
      description: "Use dark theme",
      key: "darkMode" as const,
      value: settings.darkMode
    },
    { 
      icon: Volume2, 
      label: "Sound Effects", 
      description: "Play sounds for actions",
      key: "soundEffects" as const,
      value: settings.soundEffects
    },
    { 
      icon: Vibrate, 
      label: "Haptic Feedback", 
      description: "Vibrate on interactions",
      key: "hapticFeedback" as const,
      value: settings.hapticFeedback
    },
    { 
      icon: RefreshCw, 
      label: "Auto Refresh", 
      description: "Automatically refresh data",
      key: "autoRefresh" as const,
      value: settings.autoRefresh
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-5 py-4 safe-top">
          <button onClick={onBack} className="p-2 -ml-2 tap-highlight">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">APPEARANCE</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {/* Language Select */}
          <div className="flex items-center gap-4 p-4 border-b border-border">
            <div className="p-2.5 rounded-xl bg-secondary">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">Language</p>
              <p className="text-sm text-muted-foreground">Select your language</p>
            </div>
            <Select
              value={settings.language}
              onValueChange={(value) => updateSetting("language", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-4 p-4">
            <div className="p-2.5 rounded-xl bg-secondary">
              {settings.darkMode ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark theme</p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(value) => updateSetting("darkMode", value)}
            />
          </div>
        </div>
      </div>

      {/* Behavior Section */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">BEHAVIOR</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {toggleItems.slice(1).map((item, index) => (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-4 p-4",
                index !== toggleItems.length - 2 && "border-b border-border"
              )}
            >
              <div className="p-2.5 rounded-xl bg-secondary">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={item.value}
                onCheckedChange={(value) => updateSetting(item.key, value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">ABOUT</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center gap-4 p-4">
            <div className="p-2.5 rounded-xl bg-secondary">
              <Info className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">Backspace</p>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Section */}
      <div className="px-5 mt-6">
        <button 
          onClick={() => {
            toast({
              title: "Cache Cleared",
              description: "App cache has been cleared successfully"
            });
          }}
          className="w-full py-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear Cache
        </button>
      </div>
    </div>
  );
};
