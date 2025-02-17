import { Button } from "@/components/ui/button";

interface GoogleProps {
  text: string;
}

export const Google = ({ text }: GoogleProps) => {
  return (
    <Button type="button" variant="google" className="w-full" size="lg">
      <img src="/assets/icons/google.svg" alt="Google" className="w-5 h-5" />
      {text}
    </Button>
  );
};
