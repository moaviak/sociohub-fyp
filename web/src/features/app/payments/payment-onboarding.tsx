import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { useGetOnboardingStatusQuery, useStartOnboardingMutation } from "./api";
import { toast } from "sonner";

interface PaymentOnboardingProps {
  societyId: string;
  onOnboardingComplete?: () => void;
}

export const PaymentOnboarding: React.FC<PaymentOnboardingProps> = ({
  societyId,
}) => {
  const [startOnboarding, { isLoading: isStarting }] =
    useStartOnboardingMutation();
  const {
    data,
    isLoading: isLoadingStatus,
    refetch,
  } = useGetOnboardingStatusQuery(societyId);
  const onboardingStatus = data && !("error" in data) ? data : undefined;

  const handleStartOnboarding = async () => {
    try {
      const returnUrl = `${window.location.origin}/settings/${societyId}/payments/complete`;

      const response = await startOnboarding({
        societyId,
        returnUrl,
      }).unwrap();

      if (!("error" in response)) {
        window.location.href = response.onboardingUrl;
      }
    } catch (error) {
      toast.error("Failed to start onboarding process");
      console.error("Onboarding error:", error);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      await refetch();
      toast.success("Status refreshed");
    } catch (error) {
      toast.error("Failed to refresh status");
      console.error(error);
    }
  };

  if (isLoadingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Setup</CardTitle>
          <CardDescription>Loading payment status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (onboardingStatus?.isOnboarded && onboardingStatus?.chargesEnabled) {
    return (
      <div className="space-y-4">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              Payment Setup Complete
            </CardTitle>
            <CardDescription>
              Your society is ready to accept payments for events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Account verified and active
              </div>
              {onboardingStatus.payoutsEnabled && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Payouts enabled
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center">
          <p className="flex-1 b2-regular">
            You can update or change the Society Payment Account
          </p>
          <Button onClick={handleStartOnboarding} disabled={isStarting}>
            {isStarting ? (
              "Starting Setup..."
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Update Account
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (onboardingStatus?.isOnboarded && !onboardingStatus?.chargesEnabled) {
    return (
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="w-5 h-5" />
            Payment Setup In Progress
          </CardTitle>
          <CardDescription>
            Your account is being reviewed. This usually takes 1-2 business
            days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You'll receive an email once your account is approved and ready
                to accept payments.
              </AlertDescription>
            </Alert>
            <Button onClick={handleRefreshStatus} variant="outline" size="sm">
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Setup Required
          </CardTitle>
          <CardDescription>
            To create paid events, you need to complete the payment setup
            process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">What you'll need:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Business information and tax ID</li>
              <li>• Bank account details for payouts</li>
              <li>• Identity verification documents</li>
              <li>• Contact information</li>
            </ul>
          </div>

          <div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a one-time setup process. You'll be redirected to Stripe
                to complete the verification.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleStartOnboarding}
              className="w-full"
              disabled={isStarting}
            >
              {isStarting ? (
                "Starting Setup..."
              ) : (
                <>
                  Start Payment Setup
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
