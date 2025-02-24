import { Button } from "@/components/ui/button";

interface GoogleProps {
  text: string;
  disabled?: boolean;
}

export const Google = ({ text, disabled }: GoogleProps) => {
  return (
    <Button
      type="button"
      variant="google"
      className="w-full"
      size="lg"
      disabled={disabled}
    >
      <img src="/assets/icons/google.svg" alt="Google" className="w-5 h-5" />
      {text}
    </Button>
  );
};
