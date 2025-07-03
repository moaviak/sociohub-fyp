import {
  Building,
  CalendarCheck,
  ChevronDown,
  CircleDollarSign,
  Megaphone,
  Settings,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { Society } from "@/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatSocietyName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PRIVILEGES } from "@/data";
import { NavItem } from "./nav-item";
import { Skeleton } from "@/components/ui/skeleton";

export const SocietyItems = ({
  society,
}: {
  society: Society & { privileges: string[] };
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between space-x-4 px-4 max-w-[220px]">
        <Link
          to={`/society/${society.id}`}
          className="flex items-center gap-x-2 max-w-full"
        >
          <img
            src={society.logo || "/assets/images/society-placeholder.png"}
            alt="society logo"
            className="h-8 w-8 rounded-full"
          />
          <p className="b2-medium max-w-[140px] truncate">
            {formatSocietyName(society.name)}
          </p>
        </Link>
        <CollapsibleTrigger className="group" asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="h-4 w-4 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180 group-data-[state=closed]:rotate-0" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="my-2 h-full">
        {getSocietyItems(society).map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

const getSocietyItems = (society: Society & { privileges: string[] }) => {
  return [
    {
      label: "Society Profile",
      icon: <Building className="w-4 h-4" />,
      href: `/society/${society.id}`,
    },
    {
      label: "Events",
      icon: <CalendarCheck className="w-4 h-4" />,
      href: `/events/${society.id}`,
    },
    {
      label: "Members",
      icon: <Users className="w-4 h-4" />,
      href: `/members/${society.id}`,
    },
    {
      label: "Announcements",
      icon: <Megaphone className="w-4 h-4" />,
      href: `/announcements/${society.id}`,
    },
    {
      label: "Video Meetings",
      icon: <Video className="w-4 h-4" />,
      href: `/video-meetings/${society.id}`,
    },
    ...(society.privileges.includes(PRIVILEGES.PAYMENT_FINANCE_MANAGEMENT)
      ? [
          {
            label: "Payments and Finance",
            icon: <CircleDollarSign className="w-4 h-4" />,
            href: `/payments/${society.id}`,
          },
        ]
      : []),
    ...(society.privileges.includes(PRIVILEGES.SOCIETY_SETTINGS_MANAGEMENT)
      ? [
          {
            label: "Settings",
            icon: <Settings className="w-4 h-4" />,
            href: `/settings/${society.id}`,
          },
        ]
      : []),
  ];
};

SocietyItems.Skeleton = function () {
  return (
    <div className="flex flex-col gap-y-4 px-2">
      <div className="flex gap-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-[180px]" />
      </div>
      <div className="flex gap-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-[180px]" />
      </div>
      <div className="flex gap-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-[180px]" />
      </div>
    </div>
  );
};
