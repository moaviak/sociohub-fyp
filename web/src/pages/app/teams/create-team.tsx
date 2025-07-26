import { useAppSelector } from "@/app/hooks";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateTeam } from "@/features/app/teams/create-team";
import { Team } from "@/features/app/teams/types";
import { Advisor } from "@/types";
import { Link, useLocation, useParams } from "react-router";

const CreateTeamPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { societyId } = useParams();
  const { state } = useLocation();
  const initialTeam: Team | null = state?.team || null;

  return (
    <div className="flex flex-col px-4 py-2 gap-y-4 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="text-primary-400 hover:text-primary-600 b3-medium"
              asChild
            >
              <Link to={societyId ? `/teams/${societyId}` : "/teams"}>
                Teams
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-primary-600" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary-600 b3-medium">
              {initialTeam ? "Edit Team" : "Create New Team"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CreateTeam
        societyId={societyId || (user as Advisor).societyId!}
        team={initialTeam ?? undefined}
      />
    </div>
  );
};
export default CreateTeamPage;
