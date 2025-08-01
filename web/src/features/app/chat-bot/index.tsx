import React, { useState, useRef } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Bot } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChatView } from "./components/chat-view";

// Define types that were in separate files
type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export const ChatBot: React.FC = () => {
  // --- State from both components ---
  const [position, setPosition] = useState<Position>("bottom-right");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // --- Functions from FloatingBotButton ---
  const getPositionCoordinates = (): Record<
    Position,
    { x: number; y: number }
  > => {
    if (!containerRef.current) {
      return {
        "top-left": { x: 12, y: 12 },
        "top-right": { x: window.innerWidth - 68, y: 12 },
        "bottom-left": { x: 12, y: window.innerHeight - 68 },
        "bottom-right": {
          x: window.innerWidth - 68,
          y: window.innerHeight - 68,
        },
      };
    }
    const { clientWidth, clientHeight } = containerRef.current;
    const buttonSize = 56;
    const margin = 12;
    return {
      "top-left": { x: margin, y: margin },
      "top-right": { x: clientWidth - buttonSize - margin, y: margin },
      "bottom-left": { x: margin, y: clientHeight - buttonSize - margin },
      "bottom-right": {
        x: clientWidth - buttonSize - margin,
        y: clientHeight - buttonSize - margin,
      },
    };
  };

  const getClosestCorner = (x: number, y: number): Position => {
    if (!containerRef.current) return "bottom-right";
    const { clientWidth, clientHeight } = containerRef.current;
    const centerX = clientWidth / 2;
    const centerY = clientHeight / 2;
    if (x < centerX && y < centerY) return "top-left";
    if (x >= centerX && y < centerY) return "top-right";
    if (x < centerX && y >= centerY) return "bottom-left";
    return "bottom-right";
  };

  const handleDragEnd = async (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    if (!containerRef.current) return;
    const { x, y } = info.point;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = x - containerRect.left;
    const relativeY = y - containerRect.top;
    const newPosition = getClosestCorner(relativeX, relativeY);
    setPosition(newPosition);
    const positionCoordinates = getPositionCoordinates();
    await controls.start({
      x: positionCoordinates[newPosition].x,
      y: positionCoordinates[newPosition].y,
      transition: { type: "spring", stiffness: 500, damping: 30 },
    });
  };

  // --- Combined Render Logic ---
  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-40">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <motion.button
            className={`
              w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg
              flex items-center justify-center cursor-pointer pointer-events-auto
              select-none touch-none
              ${isDragging ? "shadow-2xl z-50" : "hover:shadow-xl"}
            `}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={containerRef}
            whileDrag={{
              scale: 1.1,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={controls}
            initial={getPositionCoordinates()[position]}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            onClick={() => {
              if (!isDragging) {
                setIsPopoverOpen(true);
              }
            }}
            style={{ position: "absolute" }}
            type="button"
            aria-label="Bot Assistant"
          >
            <Bot size={24} />
          </motion.button>
        </PopoverTrigger>

        <PopoverContent
          className="w-md h-[520px] p-0 mr-4 mb-4 pointer-events-auto shadow-lg"
          side={position.includes("top") ? "bottom" : "top"}
          align={position.includes("right") ? "end" : "start"}
          onOpenAutoFocus={(e) => e.preventDefault()} // Prevents button from losing focus
        >
          <ChatView setIsPopoverOpen={setIsPopoverOpen} />
        </PopoverContent>
      </Popover>
    </div>
  );
};
