import { CalendarClock, FilePen, Info, ShieldHalf, Users } from "lucide-react";
import { useGetSocietyKPIsQuery } from "../../api";
import { KPICardSkeleton } from "@/components/skeleton/kpi-card-skeleton";

export const SocietyKPIs: React.FC<{ societyId: string }> = ({ societyId }) => {
  const { data, isLoading } = useGetSocietyKPIsQuery(societyId);

  if (isLoading || !data) {
    return (
      <div>
        <h6 className="h6-semibold">Society Key Performance Indicators</h6>
        <div className="grid grid-cols-4 gap-4 py-4">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h6 className="h6-semibold">Society Key Performance Indicators</h6>
      <div className="grid grid-cols-4 gap-4 py-4">
        <div className="flex flex-col justify-between gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1">
          <div className="flex-1 flex items-center justify-between">
            <div className="h-full space-y-3">
              <div className="b3-regular text-neutral-600">Members</div>
              <div className="h5-semibold">{data ? data.members : 0}</div>
            </div>
            <Users className="size-12 text-primary-600 p-2 rounded-full bg-primary-200/65" />
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-neutral-800" />
            <p className="b3-regular text-neutral-800">Total society members</p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1">
          <div className="flex-1 flex items-center justify-between">
            <div className="h-full space-y-3">
              <div className="b3-regular text-neutral-600">Active Events</div>
              <div>
                <p className="h5-semibold">{data ? data.activeEvents : 0}</p>
              </div>
            </div>
            <CalendarClock className="size-12 text-secondary-600 p-2 rounded-full bg-secondary-200/70" />
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-neutral-800" />
            <p className="b3-regular text-neutral-800">
              Live and upcoming events
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1">
          <div className="flex-1 flex items-center justify-between">
            <div className="h-full space-y-3">
              <div className="b3-regular text-neutral-600">Total Teams</div>
              <div>
                <p className="h5-semibold">{data ? data.totalTeams : 0}</p>
              </div>
            </div>
            <ShieldHalf className="size-12 text-yellow-500 p-2 rounded-full bg-yellow-200/65" />
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-neutral-800" />
            <p className="b3-regular text-neutral-800">
              Teams registered in society
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-y-6 p-4 bg-white rounded-lg drop-shadow-e1">
          <div className="flex-1 flex items-center justify-between">
            <div className="h-full space-y-3">
              <div className="b3-regular text-neutral-600">
                Registrations Completed
              </div>
              <div>
                <p className="h5-semibold">
                  {data ? data.upcomingEventRegistrations : 0}
                </p>
              </div>
            </div>
            <FilePen className="size-12 text-accent-500 p-2 rounded-full bg-accent-200/65" />
          </div>
          <p className="b3-regular text-neutral-800 flex items-center gap-2">
            <Info className="h-4 w-4 text-neutral-800" />
            Successful events registrations
          </p>
        </div>
      </div>
    </div>
  );
};
