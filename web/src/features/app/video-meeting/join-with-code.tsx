import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

export const JoinWithCode = () => {
  return (
    <div>
      <Button variant={"outline"}>
        <Keyboard className="w-4 h-4" />
        Join with code
      </Button>
    </div>
  );
};
