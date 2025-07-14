import { useGetOnboardingStatusQuery } from "@/features/app/payments/api";

export const usePaymentGuard = (societyId: string) => {
  const { data, isLoading } = useGetOnboardingStatusQuery(societyId);

  const onboardingStatus = data && !("error" in data) ? data : undefined;

  const canCreatePaidEvents = () => {
    return onboardingStatus?.isOnboarded && onboardingStatus?.chargesEnabled;
  };

  const needsOnboarding = () => {
    return !onboardingStatus?.isOnboarded;
  };

  const isOnboardingPending = () => {
    return onboardingStatus?.isOnboarded && !onboardingStatus?.chargesEnabled;
  };

  return {
    onboardingStatus,
    isLoading,
    canCreatePaidEvents: canCreatePaidEvents(),
    needsOnboarding: needsOnboarding(),
    isOnboardingPending: isOnboardingPending(),
  };
};
