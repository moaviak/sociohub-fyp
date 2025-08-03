import { CalendarReminder } from "@/types";
import { formatDateRange, typeColors } from "../constants";
import { Clock, Tag } from "lucide-react";

export const ReminderCard: React.FC<{ reminder: CalendarReminder }> = ({
  reminder,
}) => {
  return (
    <div className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Small rounded image on left */}
        {reminder.image && (
          <img
            src={reminder.image}
            alt={reminder.title}
            className="w-12 h-12 object-cover rounded-full flex-shrink-0"
          />
        )}

        {/* Colored dot if no image */}
        {!reminder.image && (
          <div
            className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
              typeColors[reminder.type].dot
            }`}
          />
        )}

        <div className="flex-1 min-w-0">
          <h4 className="b3-semibold mb-1 truncate">{reminder.title}</h4>
          <div className="flex items-center gap-2 b4-regular text-neutral-600 mb-2">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {formatDateRange(reminder.startDate, reminder.endDate)}
            </span>
          </div>
          {reminder.description && (
            <p className="b4-regular text-neutral-700 mb-2 line-clamp-2">
              {reminder.description}
            </p>
          )}
          <div className="flex items-center gap-1 b4-regular">
            <Tag className="w-3 h-3 flex-shrink-0" />
            <span
              className={`px-2 py-1 rounded-full b4-regular ${
                typeColors[reminder.type].bg
              } ${typeColors[reminder.type].text}`}
            >
              {reminder.type.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
