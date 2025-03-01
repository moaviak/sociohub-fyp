import { Button } from "@/components/ui/button";

interface GoogleProps {
  text: string;
  disabled?: boolean;
}

export const Google = ({ text, disabled }: GoogleProps) => {
  const handleGoogleAuth = () => {
    window.location.href = `${
      import.meta.env.VITE_REACT_APP_API_URL
    }/auth/google`;
  };

  return (
    <Button
      type="button"
      variant="google"
      className="w-full"
      size="lg"
      disabled={disabled}
      onClick={handleGoogleAuth}
    >
      <img src="/assets/icons/google.svg" alt="Google" className="w-5 h-5" />
      {text}
    </Button>
  );
};
