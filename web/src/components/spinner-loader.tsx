import React from "react";
import clsx from "clsx";

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  colorClass?: string; // for dynamic border color
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "w-4 h-4 border-2",
  sm: "w-6 h-6 border-2",
  md: "w-10 h-10 border-4",
  lg: "w-16 h-16 border-4",
  xl: "w-20 h-20 border-4",
};

export const SpinnerLoader: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
  colorClass = "border-t-primary-600 border-b-primary-600",
}) => {
  return (
    <div
      className={clsx(
        "rounded-full border-r-transparent border-l-transparent animate-spin",
        sizeClasses[size],
        colorClass,
        className
      )}
    />
  );
};
