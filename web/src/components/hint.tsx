import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HintProps {
  children: React.ReactNode;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  delay?: number | { open: number; close: number };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Hint = ({
  children,
  description,
  side = "bottom",
  sideOffset = 0,
  delay,
  open,
  onOpenChange,
}: HintProps) => {
  return (
    <TooltipProvider
      delayDuration={typeof delay === "number" ? delay : undefined}
      skipDelayDuration={typeof delay === "object" ? delay.open : undefined}
    >
      <Tooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          sideOffset={sideOffset}
          side={side}
          className="text-xs max-w-[220px] break-words"
        >
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
