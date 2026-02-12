import { useState } from "react";
import { ArrowLeft, Check, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MembershipScreenProps {
  onBack: () => void;
}

export const MembershipScreen = ({ onBack }: MembershipScreenProps) => {
  const { plans, subscription, loading, refetch } = useMembership();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    mobile: "",
    paymentType: "qr" as "qr" | "r2p"
  });

  const handleSelectPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan && plan.price > 0) {
      setSelectedPlan(planId);
      setPaymentModalOpen(true);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    if (!formData.mobile || !/^01\d{9}$/.test(formData.mobile)) {
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid Egyptian mobile number (01xxxxxxxxx)",
        variant: "destructive"
      });
      return;
    }

    setPaymentLoading(true);
    setQrCode(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('fawrypay', {
        body: {
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          customerName: profile?.full_name || user.email?.split('@')[0] || 'Customer',
          customerMobile: formData.mobile,
          customerEmail: user.email || '',
          paymentType: formData.paymentType
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (data.walletQr) {
        setQrCode(data.walletQr);
        toast({
          title: "Scan QR Code",
          description: "Scan the QR code with your mobile wallet app to complete payment"
        });
      } else {
        toast({
          title: "Payment Request Sent",
          description: "Check your mobile wallet app to confirm the payment"
        });
        setPaymentModalOpen(false);
      }

      await refetch();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-5 py-4 safe-top">
          <button onClick={onBack} className="p-2 -ml-2 tap-highlight">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Membership & Billing</h1>
        </div>
      </div>

      {/* Current Plan */}
      {subscription && (
        <div className="px-5 mt-6">
          <div className="p-5 rounded-2xl bg-gradient-glow border border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-foreground/70">Current Plan</p>
                <p className="text-2xl font-bold text-primary-foreground">
                  {subscription.plan?.name || 'Unknown'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-foreground/70">Credits</p>
                <p className="text-2xl font-bold text-primary-foreground">
                  {profile?.credits || 0}
                </p>
              </div>
            </div>
            {subscription.current_period_end && (
              <p className="text-sm text-primary-foreground/70 mt-4">
                Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="px-5 mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
        <div className="space-y-4">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all",
                  isCurrentPlan 
                    ? "bg-primary/10 border-primary" 
                    : "bg-card border-border"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-2xl font-bold text-foreground">
                      {plan.price === 0 ? 'Free' : `${plan.price} EGP`}
                      {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                    </p>
                  </div>
                  {isCurrentPlan ? (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary text-primary-foreground">
                      Current
                    </span>
                  ) : plan.price > 0 ? (
                    <Button onClick={() => handleSelectPlan(plan.id)}>
                      Upgrade
                    </Button>
                  ) : null}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              Pay with your mobile wallet (Vodafone Cash, Orange Money, etc.)
            </DialogDescription>
          </DialogHeader>

          {qrCode ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with your mobile wallet app
              </p>
              <img 
                src={qrCode} 
                alt="Payment QR Code" 
                className="w-64 h-64 rounded-lg border"
              />
              <Button 
                variant="outline" 
                onClick={() => {
                  setQrCode(null);
                  setPaymentModalOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Wallet Number</Label>
                <Input
                  id="mobile"
                  placeholder="01xxxxxxxxx"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={formData.paymentType === 'qr' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, paymentType: 'qr' })}
                    className="w-full"
                  >
                    QR Code
                  </Button>
                  <Button
                    type="button"
                    variant={formData.paymentType === 'r2p' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, paymentType: 'r2p' })}
                    className="w-full"
                  >
                    Request to Pay
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.paymentType === 'qr' 
                    ? 'Scan a QR code to pay' 
                    : 'Receive a payment request on your phone'}
                </p>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={paymentLoading}
                className="w-full"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay {plans.find(p => p.id === selectedPlan)?.price} EGP</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
