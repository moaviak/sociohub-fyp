import { useState, useEffect, useMemo } from "react";
import {
  format,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isValid,
  isSameDay,
  isAfter,
  startOfDay,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Helper to format a Date object to HH:mm (24-hour)
const formatTime24 = (date: Date | undefined): string => {
  if (!date || !isValid(date)) return "";
  return format(date, "HH:mm");
};

// Helper to parse HH:mm (24-hour) into hours and minutes numbers
const parseTime24 = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return { hours, minutes };
};

// Helper to create a combined date-time
const combineDateAndTime = (date: Date, timeString: string) => {
  if (!date || !isValid(date)) return undefined;

  const timeParts = parseTime24(timeString);
  if (!timeParts) return date;

  let newDate = new Date(date);
  newDate = setHours(newDate, timeParts.hours);
  newDate = setMinutes(newDate, timeParts.minutes);
  newDate = setSeconds(newDate, 0);
  newDate = setMilliseconds(newDate, 0);

  return newDate;
};

interface DateTimePickerProps {
  /**
   * The controlled value of the combined date and time.
   */
  value?: Date;
  /**
   * Callback function that is called when the date or time changes and is confirmed.
   * Receives the new combined Date object.
   */
  onChange?: (date: Date | undefined) => void;
  /**
   * Function to determine if a date should be disabled in the calendar.
   */
  disabled?: (date: Date) => boolean;
  /**
   * Class name for the popover trigger button.
   */
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  const [tempTime, setTempTime] = useState(formatTime24(value));

  // Keep internal state in sync with external value
  useEffect(() => {
    setTempDate(value);
    setTempTime(formatTime24(value));
  }, [value]);

  // Get current date and time for restrictions
  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => startOfDay(now), [now]);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Parse time parts once instead of multiple times
  const timeParts = parseTime24(tempTime);
  const currentHours24 = timeParts?.hours ?? 0;
  const currentMinutes = timeParts?.minutes ?? 0;
  const currentHours12 = currentHours24 % 12 || 12;
  const currentPeriod = currentHours24 >= 12 ? "PM" : "AM";

  // Check if the selected date is today
  const isToday = tempDate ? isSameDay(tempDate, today) : false;

  // Generate time options with restrictions for today
  const hours12Options = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  // Create 1-minute interval options
  const minutesOptions = Array.from({ length: 60 }, (_, i) =>
    (i * 1).toString().padStart(2, "0")
  );

  // Determine if a specific hour is disabled
  const isHourDisabled = (hour12: number, period: string) => {
    if (!isToday) return false;

    let hour24 = hour12;
    if (period === "PM" && hour12 !== 12) hour24 += 12;
    if (period === "AM" && hour12 === 12) hour24 = 0;

    return hour24 < currentHour;
  };

  // Determine if a specific minute is disabled
  // const isMinuteDisabled = (minute: number) => {
  //   if (!isToday) return false;
  //   if (currentHours24 > currentHour) return false;
  //   if (currentHours24 < currentHour) return true;

  //   return minute < currentMinute;
  // };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setTempDate(undefined);
      return;
    }

    setTempDate(date);

    // If selecting today and current time is in the past, reset to current time
    if (isSameDay(date, today)) {
      const combined = combineDateAndTime(date, tempTime);
      if (combined && isAfter(now, combined)) {
        // Round up to the next 5 minutes
        const roundedMinutes = Math.ceil((currentMinute + 1) / 5) * 5;
        const newHours = roundedMinutes >= 60 ? currentHour + 1 : currentHour;
        const newMinutes =
          roundedMinutes >= 60 ? roundedMinutes - 60 : roundedMinutes;

        const newTime = `${String(newHours).padStart(2, "0")}:${String(
          newMinutes
        ).padStart(2, "0")}`;
        setTempTime(newTime);
      }
    }
  };

  // Handle time change in a single function
  const handleTimeChange = (hours24: number, minutes: number) => {
    // Prevent selecting past time on today
    if (isToday) {
      if (
        hours24 < currentHour ||
        (hours24 === currentHour && minutes < currentMinute)
      ) {
        return;
      }
    }

    const newTime = `${String(hours24).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
    setTempTime(newTime);
  };

  // Handle hour change
  const handleHourChange = (hour12: string) => {
    const hours24 =
      currentPeriod === "PM" && hour12 !== "12"
        ? parseInt(hour12, 10) + 12
        : currentPeriod === "AM" && hour12 === "12"
        ? 0
        : parseInt(hour12, 10);

    handleTimeChange(hours24, currentMinutes);
  };

  // Handle minute change
  const handleMinuteChange = (minute: string) => {
    handleTimeChange(currentHours24, parseInt(minute, 10));
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    let hours24 = currentHours24;

    if (period === "PM" && currentHours24 < 12) {
      hours24 += 12;
    } else if (period === "AM" && currentHours24 >= 12) {
      hours24 -= 12;
    }

    handleTimeChange(hours24, currentMinutes);
  };

  // Handle OK button click
  const handleOk = () => {
    if (tempDate && isValid(tempDate)) {
      const finalDate = combineDateAndTime(tempDate, tempTime);
      onChange?.(finalDate);
    } else {
      onChange?.(undefined);
    }
    setIsOpen(false);
  };

  // Format the display string for the trigger button
  const displayValue =
    value && isValid(value)
      ? format(value, "MM/dd/yyyy hh:mm a")
      : "Pick date and time";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between text-left font-normal outline outline-neutral-400",
            !value && "text-muted-foreground",
            className
          )}
        >
          {displayValue}
          <CalendarIcon className="h-4 w-4 text-neutral-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex flex-col md:flex-row">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={tempDate}
            onSelect={handleDateSelect}
            disabled={disabled}
            captionLayout={"dropdown"}
            classNames={{
              day_button: "hover:bg-primary-600 hover:text-white",
              selected: "[&._*]:bg-primary-600",
            }}
            autoFocus
          />
        </div>
        <div className="p-3 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col items-center justify-center space-y-3">
          <div className="text-sm font-semibold">Select Time</div>
          <div className="flex space-x-2 items-center">
            {/* Hour Select */}
            <select
              className="border rounded px-2 py-1 text-center"
              value={currentHours12.toString().padStart(2, "0")}
              onChange={(e) => handleHourChange(e.target.value)}
            >
              {hours12Options.map((hour) => (
                <option
                  key={hour}
                  value={hour}
                  disabled={isHourDisabled(parseInt(hour, 10), currentPeriod)}
                >
                  {hour}
                </option>
              ))}
            </select>
            <span>:</span>
            {/* Minute Select */}
            <select
              className="border rounded px-2 py-1 text-center"
              value={currentMinutes.toString().padStart(2, "0")}
              onChange={(e) => handleMinuteChange(e.target.value)}
            >
              {minutesOptions.map((minute) => (
                <option
                  key={minute}
                  value={minute}
                  disabled={
                    isToday &&
                    currentHours24 === currentHour &&
                    parseInt(minute, 10) < currentMinute
                  }
                >
                  {minute}
                </option>
              ))}
            </select>
            {/* AM/PM Select */}
            <select
              className="border rounded px-2 py-1 text-center"
              value={currentPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              disabled={isToday && currentHour >= 12 && currentPeriod === "AM"}
            >
              {["AM", "PM"].map((period) => (
                <option
                  key={period}
                  value={period}
                  disabled={isToday && period === "AM" && currentHour >= 12}
                >
                  {period}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end p-3 border-t border-gray-200 space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleOk}>
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
