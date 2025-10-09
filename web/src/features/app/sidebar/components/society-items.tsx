import {
  Building,
  CalendarCheck,
  ChevronDown,
  CircleDollarSign,
  ImagePlus,
  Megaphone,
  Settings,
  ShieldHalf,
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
  onClick,
}: {
  society: Society & { privileges: string[] };
  onClick?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between space-x-4 lg:px-4 px-2 lg:max-w-[220px] max-w-full">
        <Link
          to={`/society/${society.id}`}
          className="flex items-center gap-x-2 max-w-full"
          onClick={() => onClick?.()}
        >
          <img
            src={society.logo || "/assets/images/society-placeholder.png"}
            alt="society logo"
            className="lg:size-8 size-7 rounded-full"
          />
          <p className="b2-medium lg:max-w-[100px] max-w-[70px] truncate">
            {formatSocietyName(society.name)}
          </p>
        </Link>
        <CollapsibleTrigger className="group" asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="size-4 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180 group-data-[state=closed]:rotate-0" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="my-2 h-full">
        {getSocietyItems(society).map((item) => (
          <NavItem key={item.href} item={item} onClick={onClick} />
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
    {
      label: "Teams",
      icon: <ShieldHalf className="w-4 h-4" />,
      href: `/teams/${society.id}`,
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
    ...(society.privileges.includes(PRIVILEGES.CONTENT_MANAGEMENT)
      ? [
          {
            label: "Create Post",
            icon: <ImagePlus className="w-4 h-4" />,
            href: `/create-post/${society.id}`,
          },
        ]
      : []),
    ...(society.privileges.includes(PRIVILEGES.SOCIETY_SETTINGS_MANAGEMENT) ||
    society.privileges.includes(PRIVILEGES.PAYMENT_FINANCE_MANAGEMENT)
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
