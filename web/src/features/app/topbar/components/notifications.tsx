import { Bell } from "lucide-react";

import { formatCount } from "@/lib/utils";

export const Notifications = () => {
  return (
    <div className="relative cursor-pointer">
      <Bell className="w-6 h-6 text-primary-600" />
      <span className="bg-red-500 text-white rounded-full flex justify-center items-center b4-regular absolute -top-1.5 -right-1.5 w-[18px] h-[18px]">
        {formatCount(10)}
      </span>
    </div>
  );
};
