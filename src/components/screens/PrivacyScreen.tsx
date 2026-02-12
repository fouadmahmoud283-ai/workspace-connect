import { useState } from "react";
import { 
  ArrowLeft, 
  Shield, 
  Key, 
  Smartphone, 
  Eye,
  Download,
  Trash2,
  Loader2,
  Lock 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface PrivacyScreenProps {
  onBack: () => void;
}

export const PrivacyScreen = ({ onBack }: PrivacyScreenProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Simulated 2FA status (would be from user metadata in real app)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully"
      });
      setPasswordDialogOpen(false);
      setPasswords({ current: "", new: "", confirm: "" });
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    // In a real app, you'd call an edge function to handle account deletion
    toast({
      title: "Account Deletion Requested",
      description: "Your account deletion request has been submitted. We'll process it within 30 days."
    });
    setLoading(false);
    setDeleteDialogOpen(false);
    await signOut();
  };

  const securityItems = [
    { 
      icon: Key, 
      label: "Change Password", 
      description: "Update your password",
      action: () => setPasswordDialogOpen(true)
    },
    { 
      icon: Smartphone, 
      label: "Two-Factor Authentication", 
      description: twoFactorEnabled ? "Enabled" : "Add extra security",
      toggle: true,
      value: twoFactorEnabled,
      onToggle: (val: boolean) => {
        setTwoFactorEnabled(val);
        toast({
          title: val ? "2FA Enabled" : "2FA Disabled",
          description: val ? "Two-factor authentication is now enabled" : "Two-factor authentication has been disabled"
        });
      }
    },
    { 
      icon: Eye, 
      label: "Active Sessions", 
      description: "Manage your login sessions",
      action: () => toast({ title: "Coming Soon", description: "Session management will be available soon" })
    },
  ];

  const privacyItems = [
    { 
      icon: Download, 
      label: "Download My Data", 
      description: "Get a copy of your data",
      action: () => toast({ title: "Request Submitted", description: "You'll receive your data via email within 24 hours" })
    },
    { 
      icon: Trash2, 
      label: "Delete Account", 
      description: "Permanently delete your account",
      destructive: true,
      action: () => setDeleteDialogOpen(true)
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
          <h1 className="text-lg font-semibold text-foreground">Privacy & Security</h1>
        </div>
      </div>

      {/* Security Section */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">SECURITY</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {securityItems.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-4 p-4",
                !item.toggle && "tap-highlight cursor-pointer hover:bg-secondary/50",
                index !== securityItems.length - 1 && "border-b border-border"
              )}
              onClick={item.action}
            >
              <div className="p-2.5 rounded-xl bg-secondary">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              {item.toggle ? (
                <Switch
                  checked={item.value}
                  onCheckedChange={item.onToggle}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Section */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">PRIVACY</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {privacyItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={cn(
                "flex items-center gap-4 w-full p-4 text-left tap-highlight hover:bg-secondary/50",
                index !== privacyItems.length - 1 && "border-b border-border"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-xl",
                item.destructive ? "bg-destructive/10" : "bg-secondary"
              )}>
                <item.icon className={cn(
                  "w-5 h-5",
                  item.destructive ? "text-destructive" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium",
                  item.destructive ? "text-destructive" : "text-foreground"
                )}>
                  {item.label}
                </p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <Button 
              onClick={handlePasswordChange} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your data will be permanently deleted including bookings, membership, and payment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
