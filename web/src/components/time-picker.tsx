import { Clock } from "lucide-react"; // Import the Clock icon

import { useTimePicker } from "@/hooks/useTimePicker";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  /**
   * The controlled value of the time picker in HH:mm format (24-hour).
   */
  value: string;
  /**
   * Callback function that is called when the time value changes.
   * Receives the new value in HH:mm format.
   */
  onChange: (time: string) => void;
  /**
   * The minimum selectable time in HH:mm format.
   */
  min?: string;
  /**
   * The maximum selectable time in HH:mm format.
   */
  max?: string;
  /**
   * Whether the time picker is disabled.
   */
  disabled?: boolean;
  /**
   * Class name for the root container element.
   */
  containerClassName?: string;
  /**
   * Class name for the visible input element.
   */
  inputClassName?: string;
  /**
   * Class name for the Lucide Clock icon.
   */
  iconClassName?: string;
}

/**
 * A customizable Time Picker component built using the useTimePicker hook.
 * Resembles the input field shown in the image with a custom icon.
 */
export function TimePicker({
  value,
  onChange,
  min,
  max,
  disabled,
  containerClassName,
  inputClassName,
  iconClassName,
}: TimePickerProps) {
  const { time, openPicker, nativeInputProps } = useTimePicker({
    value,
    onChange,
    min,
    max,
    disabled,
  });

  // Function to format HH:mm (24-hour) to a more readable 12-hour format (e.g., 11:30 AM)
  const formatTimeTo12Hour = (time24: string): string => {
    if (!time24) return "";
    try {
      const [hours, minutes] = time24.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return time24; // Return as is if parsing fails

      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM/PM

      return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
    } catch (e) {
      console.error("Failed to format time:", time24, e);
      return time24; // Return original if any error occurs during formatting
    }
  };

  return (
    <div
      className={`relative flex items-center border border-neutral-400 rounded-md overflow-hidden ${
        containerClassName || ""
      }`}
    >
      {/* The hidden native input */}
      <input {...nativeInputProps} />

      {/* The visible input-like element */}
      {/* We use a button here to allow focus and keyboard interaction that triggers the picker */}
      <Button
        type="button" // Important for accessibility and not submitting forms
        variant="ghost"
        onClick={openPicker}
        disabled={disabled}
        className={cn(
          "w-full justify-between text-left font-normal",
          !value && "text-muted-foreground",
          inputClassName
        )}
        aria-label="Select time" // Provide an accessible label
      >
        {/* Display the formatted time */}
        {time ? formatTimeTo12Hour(time) : "Pick a time"}
        <Clock className={`h-4 w-4 text-neutral-600 ${iconClassName || ""}`} />
      </Button>
    </div>
  );
}
