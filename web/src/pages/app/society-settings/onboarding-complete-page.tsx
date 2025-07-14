import { SpinnerLoader } from "@/components/spinner-loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCompleteOnboardingMutation } from "@/features/app/payments/api";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { CheckCircle2Icon } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const OnboardingCompletePage = () => {
  const societyId = useGetSocietyId();
  const [completeOnboarding, { isLoading }] = useCompleteOnboardingMutation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleComplete = async () => {
      try {
        await completeOnboarding({ societyId: societyId! }).unwrap();
      } catch (error) {
        console.error(error);
        navigate(`/settings/${societyId}/payments`);
      }
    };

    handleComplete();
  }, [completeOnboarding, navigate, societyId]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <SpinnerLoader size="sm" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Alert className="gap-x-4!">
        <CheckCircle2Icon className="size-6! text-emerald-500!" />
        <AlertTitle className="b1-semibold">
          Success! The on-boarding process completed
        </AlertTitle>
        <AlertDescription className="b3-regular">
          Now after the account review, you can start accepting payments on
          platform.
        </AlertDescription>
      </Alert>
    </div>
  );
};
export default OnboardingCompletePage;
