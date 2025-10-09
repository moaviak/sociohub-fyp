import { CalendarClock, FilePen, Info, ShieldHalf, Users } from "lucide-react";
import { useGetSocietyKPIsQuery } from "../../api";
import { KPICardSkeleton } from "@/components/skeleton/kpi-card-skeleton";
import { cn } from "@/lib/utils";

export const SocietyKPIs: React.FC<{ societyId: string }> = ({ societyId }) => {
  const { data, isLoading } = useGetSocietyKPIsQuery(societyId);

  if (isLoading || !data) {
    return (
      <div>
        <h6 className="h6-semibold px-4 sm:px-0">
          Society Key Performance Indicators
        </h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 px-4 sm:px-0">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Members",
      value: data.members,
      icon: Users,
      iconColor: "text-primary-600",
      iconBg: "bg-primary-200/65",
      description: "Total society members",
    },
    {
      label: "Active Events",
      value: data.activeEvents,
      icon: CalendarClock,
      iconColor: "text-secondary-600",
      iconBg: "bg-secondary-200/70",
      description: "Live and upcoming events",
    },
    {
      label: "Total Teams",
      value: data.totalTeams,
      icon: ShieldHalf,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-200/65",
      description: "Teams registered in society",
    },
    {
      label: "Registrations Completed",
      value: data.upcomingEventRegistrations,
      icon: FilePen,
      iconColor: "text-accent-500",
      iconBg: "bg-accent-200/65",
      description: "Successful events registrations",
    },
  ];

  return (
    <div>
      <h6 className="h6-semibold px-4 sm:px-0">
        Society Key Performance Indicators
      </h6>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 px-4 sm:px-0">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="flex flex-col justify-between gap-y-4 sm:gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1"
            >
              <div className="flex-1 flex items-center justify-between">
                <div className="h-full space-y-2 sm:space-y-3 flex-1 min-w-0">
                  <div className="b3-regular text-neutral-600 truncate">
                    {card.label}
                  </div>
                  <div className="h5-semibold">{card.value || 0}</div>
                </div>
                <Icon
                  className={cn(
                    "size-10 sm:size-12 text-current p-2 rounded-full flex-shrink-0 ml-2",
                    card.iconColor,
                    card.iconBg
                  )}
                />
              </div>
              <div className="flex items-start sm:items-center gap-2">
                <Info className="h-4 w-4 text-neutral-800 flex-shrink-0 mt-0.5 sm:mt-0" />
                <p className="b3-regular text-neutral-800 break-words">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
