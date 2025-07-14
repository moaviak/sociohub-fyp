import { SpinnerLoader } from "@/components/spinner-loader";
import {
  useGetOnboardingStatusQuery,
  useStartOnboardingMutation,
} from "@/features/app/payments/api";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const OnboardingRefreshPage = () => {
  const societyId = useGetSocietyId();

  const [startOnboarding] = useStartOnboardingMutation();
  const { data } = useGetOnboardingStatusQuery(societyId!);
  const onboardingStatus = data && !("error" in data) ? data : undefined;

  const navigate = useNavigate();

  useEffect(() => {
    const handleStartOnboarding = async () => {
      try {
        const returnUrl = `${window.location.origin}/settings/${societyId}/payments/complete`;

        const response = await startOnboarding({
          societyId: societyId!,
          returnUrl,
        }).unwrap();

        if (!("error" in response)) {
          window.location.href = response.onboardingUrl;
        }
      } catch (error) {
        toast.error("Failed to refresh the onboarding process");
        console.error("Onboarding error:", error);
        navigate(`/settings/${societyId}/payments`);
      }
    };

    if (onboardingStatus && !onboardingStatus.isOnboarded)
      handleStartOnboarding();

    if (onboardingStatus?.isOnboarded) {
      navigate(`/settings/${societyId}/payments`);
    }
  }, [societyId, startOnboarding, navigate, onboardingStatus?.isOnboarded]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <SpinnerLoader size="sm" />
    </div>
  );
};
export default OnboardingRefreshPage;
