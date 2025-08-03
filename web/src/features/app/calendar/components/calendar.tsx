import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CalendarReminder } from "@/types";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { formatDateRange, typeColors } from "../constants";

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  fullDate: Date;
}

interface CalendarDayWithPosition extends CalendarDay {
  index: number;
  row: number;
  col: number;
}

interface BannerSegment {
  reminder: CalendarReminder;
  reminderIndex: number;
  row: number;
  startCol: number;
  endCol: number;
  width: number;
  showTitle: boolean;
}

interface CustomCalendarProps {
  reminders: CalendarReminder[];
  variant?: "default" | "mini";
}

interface ReminderHoverCardProps {
  children: React.ReactNode;
  dayReminders: CalendarReminder[];
}

export const Calendar: React.FC<CustomCalendarProps> = ({
  reminders,
  variant = "default",
}) => {
  const [displayDate, setDisplayDate] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [showYearPicker, setShowYearPicker] = useState<boolean>(false);

  const today = new Date();

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust for Monday start

    const days: CalendarDay[] = [];

    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i),
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day),
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, day),
      });
    }

    return days;
  };

  const getRemindersForDate = (date: Date): CalendarReminder[] => {
    // Convert the date to start and end of day for comparison
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return reminders.filter((reminder) => {
      // Parse the reminder dates (they could be ISO strings or already Date objects)
      const reminderStart = new Date(reminder.startDate);
      const reminderEnd = new Date(reminder.endDate);

      // Check if the day overlaps with the reminder period
      // A reminder is shown on a day if:
      // - The reminder starts on or before the end of the day AND
      // - The reminder ends on or after the start of the day
      return reminderStart <= dayEnd && reminderEnd >= dayStart;
    });
  };

  // Calculate banner segments for continuous display across rows
  const calculateBannerSegments = (days: CalendarDay[]): BannerSegment[] => {
    const segments: BannerSegment[] = [];
    const processedReminders = new Set<number>();

    reminders.forEach((reminder, reminderIndex) => {
      if (processedReminders.has(reminderIndex)) return;

      // Find all days this reminder spans in current month
      const reminderDays: CalendarDayWithPosition[] = days
        .map((day, index) => ({
          ...day,
          index,
          row: Math.floor(index / 7),
          col: index % 7,
        }))
        .filter((day) => {
          if (!day.isCurrentMonth) return false;

          // Use the same logic as getRemindersForDate for consistency
          const dayStart = new Date(day.fullDate);
          dayStart.setHours(0, 0, 0, 0);

          const dayEnd = new Date(day.fullDate);
          dayEnd.setHours(23, 59, 59, 999);

          const reminderStart = new Date(reminder.startDate);
          const reminderEnd = new Date(reminder.endDate);

          return reminderStart <= dayEnd && reminderEnd >= dayStart;
        });

      if (reminderDays.length === 0) return;

      // Group days by row
      const daysByRow: Record<number, CalendarDayWithPosition[]> = {};
      reminderDays.forEach((day) => {
        if (!daysByRow[day.row]) daysByRow[day.row] = [];
        daysByRow[day.row].push(day);
      });

      // Create segments for each row
      Object.keys(daysByRow).forEach((rowKey, rowIndex) => {
        const row = parseInt(rowKey);
        const rowDays = daysByRow[row].sort((a, b) => a.col - b.col);
        const startCol = rowDays[0].col;
        const endCol = rowDays[rowDays.length - 1].col;

        segments.push({
          reminder,
          reminderIndex,
          row,
          startCol,
          endCol,
          width: endCol - startCol + 1,
          showTitle: rowIndex === 0, // Show title only on first row
        });
      });

      processedReminders.add(reminderIndex);
    });

    // Sort segments by row and then by start column to handle stacking
    return segments.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.startCol - b.startCol;
    });
  };

  const navigateMonth = (direction: number): void => {
    setDisplayDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const setMonth = (month: number): void => {
    setDisplayDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(month);
      return newDate;
    });
    setShowMonthPicker(false);
  };

  const setYear = (year: number): void => {
    setDisplayDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearPicker(false);
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(displayDate);
  const bannerSegments = calculateBannerSegments(days);
  const monthYear = displayDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isCompact = variant === "mini";

  const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = displayDate.getFullYear();
  const years: number[] = Array.from(
    { length: 21 },
    (_, i) => currentYear - 10 + i
  );

  const ReminderHoverCard: React.FC<ReminderHoverCardProps> = ({
    children,
    dayReminders,
  }) => (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="p-4 max-w-none w-auto"
        align="center"
        side="top"
        sideOffset={5}
        alignOffset={0}
        collisionPadding={20}
        avoidCollisions={true}
      >
        <div className="flex gap-x-4 max-w-[80vw]">
          {dayReminders.map((reminder, index) => (
            <div
              key={index}
              className="border-r last:border-r-0 pr-4 last:pr-0 max-w-60"
            >
              {reminder.image && (
                <img
                  src={reminder.image}
                  alt={reminder.title}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <div className="flex items-start gap-3">
                <div
                  className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                    typeColors[reminder.type].dot
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 break-words">
                    {reminder.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="break-words">
                      {formatDateRange(reminder.startDate, reminder.endDate)}
                    </span>
                  </div>
                  {reminder.description && (
                    <p className="text-xs text-gray-700 mb-2 break-words">
                      {reminder.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs">
                    <Tag className="w-3 h-3 flex-shrink-0" />
                    <span
                      className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        typeColors[reminder.type].bg
                      } ${typeColors[reminder.type].text}`}
                    >
                      {reminder.type.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${
        isCompact ? "p-3" : "p-6"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className={`p-2 hover:bg-gray-100 rounded-md transition-colors ${
            isCompact ? "text-sm" : ""
          }`}
        >
          <ChevronLeft className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
        </button>

        <div className="flex items-center gap-2">
          {variant === "default" ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-xl">
                    {displayDate.toLocaleDateString("en-US", { month: "long" })}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showMonthPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 grid grid-cols-3 gap-1 p-2 w-48">
                    {months.map((month, index) => (
                      <button
                        key={month}
                        onClick={() => setMonth(index)}
                        className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                          index === displayDate.getMonth()
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        }`}
                      >
                        {month.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowYearPicker(!showYearPicker)}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-xl">
                    {displayDate.getFullYear()}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showYearPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => setYear(year)}
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                          year === displayDate.getFullYear()
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <h2 className="font-semibold text-gray-900 text-lg">{monthYear}</h2>
          )}
        </div>

        <button
          onClick={() => navigateMonth(1)}
          className={`p-2 hover:bg-gray-100 rounded-md transition-colors ${
            isCompact ? "text-sm" : ""
          }`}
        >
          <ChevronRight className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
          <div
            key={day}
            className={`text-center font-medium text-gray-500 ${
              isCompact ? "text-xs py-1" : "text-sm py-2"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid container */}
      <div className="relative">
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayReminders = getRemindersForDate(day.fullDate);
            const hasReminders = dayReminders.length > 0;
            const isTodayDate = isToday(day.fullDate);

            const dayElement = (
              <div
                key={index}
                className={`
                    relative border border-gray-100 transition-colors
                    ${isCompact ? "h-8 p-1" : "h-24 p-2"}
                    ${day.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                    ${hasReminders ? "cursor-pointer hover:bg-gray-50" : ""}
                  `}
              >
                {/* Date number */}
                <div
                  className={`
                    font-medium
                    ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                    ${isCompact ? "text-xs" : "text-sm"}
                    ${
                      isTodayDate
                        ? (isCompact ? "w-5 h-5" : "w-6 h-6") +
                          " bg-blue-500 text-white rounded-full flex items-center justify-center"
                        : ""
                    }
                  `}
                >
                  {day.date}
                </div>

                {/* Mini variant: show colored underlines */}
                {isCompact && hasReminders && (
                  <div className="absolute inset-x-1 bottom-1 space-y-0.5">
                    {dayReminders.slice(0, 4).map((reminder, idx) => (
                      <div
                        key={idx}
                        className={`h-0.5 w-4 ${typeColors[reminder.type].dot}`}
                        style={{ marginBottom: "1px" }}
                      />
                    ))}
                    {dayReminders.length > 4 && (
                      <div className="h-0.5 w-2 bg-gray-400" />
                    )}
                  </div>
                )}
              </div>
            );

            return hasReminders ? (
              <ReminderHoverCard key={index} dayReminders={dayReminders}>
                {dayElement}
              </ReminderHoverCard>
            ) : (
              dayElement
            );
          })}
        </div>

        {/* Banner segments overlay for default variant */}
        {!isCompact && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-7 gap-1">
            {days.map((_day, dayIndex) => {
              const row = Math.floor(dayIndex / 7);
              const col = dayIndex % 7;

              // Find banner segments that should start at this position
              const segmentsStartingHere = bannerSegments.filter(
                (segment) => segment.row === row && segment.startCol === col
              );

              return (
                <div key={dayIndex} className="relative h-24">
                  {segmentsStartingHere.map((segment) => {
                    // Count how many other banners are already stacked at this position
                    const sameDayBanners = bannerSegments.filter(
                      (s) =>
                        s.row === segment.row &&
                        s.startCol <= segment.startCol &&
                        s.endCol >= segment.startCol &&
                        bannerSegments.indexOf(s) <=
                          bannerSegments.indexOf(segment)
                    );
                    const stackIndex = sameDayBanners.length - 1;

                    return (
                      <div
                        key={`${segment.reminderIndex}-${segment.row}`}
                        className={`
                            absolute text-xs px-2 py-1 rounded-sm pointer-events-auto line-clamp-1 min-h-[20px]
                            ${typeColors[segment.reminder.type].bg}
                            ${typeColors[segment.reminder.type].text}
                            ${typeColors[segment.reminder.type].border}
                          `}
                        style={{
                          bottom: `${stackIndex * 22 + 4}px`,
                          left: 0,
                          width: `${
                            segment.width * 100 + (segment.width - 1) * 4
                          }%`,
                          zIndex: 10 + stackIndex,
                        }}
                      >
                        {segment.showTitle ? segment.reminder.title : ""}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
