import { Link, Navigate } from "react-router";
import { useGetSocietyQuery } from "../api";
import { SpinnerLoader } from "@/components/spinner-loader";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "../explore/components/registration-form";
import { useCancelJoinRequestMutation } from "../explore/api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { useAppSelector } from "@/app/hooks";
import { CalendarCheck, ClipboardList, Edit, Images } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocietyEvents } from "./components/society-events";
import { SocietyInfo } from "./components/society-info";
import { haveSettingsPrivilege } from "@/lib/utils";
import { Advisor } from "@/types";
import { SocietyPosts } from "../posts/society-posts";

interface SocietyProps {
  id: string;
}

export const Society = ({ id }: SocietyProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetSocietyQuery({ societyId: id });
  const [cancelJoinRequest, { isLoading: isCancelling }] =
    useCancelJoinRequestMutation();

  const society = data && !("error" in data) ? data : undefined;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <SpinnerLoader />
      </div>
    );
  }

  if (!society) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const isStudent = user && "registrationNumber" in user;
  const havePermissionToEdit = isStudent
    ? haveSettingsPrivilege(user.societies || [], society.id)
    : id === (user as Advisor).societyId;

  const onCancelRequest = async () => {
    try {
      const response = await cancelJoinRequest({
        societyId: society.id,
      }).unwrap();

      if (!("error" in response)) {
        toast.success("Request successfully cancelled.");
      } else {
        throw new Error("Unexpected error occurred.");
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unexpected error occurred.";
      toast.error(message);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <img
          src={society.logo || "/assets/images/society-placeholder.png"}
          alt="society-logo"
          className="h-24 w-24 rounded-full"
        />

        <div className="space-y-2 flex-1">
          <h5 className="h5-semibold">{society.name}</h5>
          <div className="flex gap-4">
            <p className="b3-regular">
              <span className="b3-semibold text-primary-600">
                {society._count?.members || 0}
              </span>{" "}
              Members
            </p>
            <p className="b3-regular">
              <span className="b3-semibold text-primary-600">
                {society._count?.events || 0}
              </span>{" "}
              Upcoming Event
              {society._count?.events && society._count?.events > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {!society.acceptingNewMembers ? (
          <></>
        ) : society.isMember || society.hasRequestedToJoin ? (
          <Button
            variant={society.hasRequestedToJoin ? "destructive" : "outline"}
            disabled={society.isMember || isCancelling}
            onClick={onCancelRequest}
          >
            {society.hasRequestedToJoin ? "Cancel Request" : "Joined"}
          </Button>
        ) : (
          <RegistrationForm society={society} className="w-auto" />
        )}
        {havePermissionToEdit && (
          <Button variant={"outline"} size="sm" asChild>
            <Link to={`/settings/${society.id}/profile`} state={{ society }}>
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
          </Button>
        )}
      </div>

      {society.advisor && (
        <div>
          <p className="b1-semibold">Society Advisor</p>
          <Link
            to={`/profile/${society.advisor.id}`}
            className="flex flex-col items-center w-max p-4 gap-2"
          >
            <img
              src={
                society.advisor.avatar || "/assets/image/avatar-placeholder.png"
              }
              alt="advisor avatar"
              className="h-16 w-16 rounded-full object-cover"
            />
            <p className="b3-medium">{society.advisor.displayName}</p>
          </Link>
        </div>
      )}
      {society.officeBearers && society.officeBearers.length > 0 && (
        <div>
          <p className="b1-semibold">Society Office Bearers</p>
          <div className="flex justify-between">
            {society.officeBearers.map((item) => (
              <Link
                key={item.role}
                to={`/profile/${item.student.id}`}
                className="flex flex-col items-center w-max p-4 gap-2"
              >
                <img
                  src={
                    item.student.avatar ||
                    "/assets/image/avatar-placeholder.png"
                  }
                  alt="advisor avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div className="text-center">
                  <p className="b3-semibold">{item.role}</p>
                  <p className="b3-medium">{`${item.student.firstName} ${item.student.lastName}`}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Tabs className="flex-1" defaultValue="posts">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className="b2-semibold gap-x-3" value="posts">
            <Images className="w-6 h-6 text-primary-600" />
            Posts
          </TabsTrigger>
          <TabsTrigger className="b2-semibold gap-x-3" value="events">
            <CalendarCheck className="w-6 h-6 text-primary-600" />
            Events
          </TabsTrigger>
          <TabsTrigger className="b2-semibold gap-x-3" value="more-info">
            <ClipboardList className="w-6 h-6 text-primary-600" />
            More Info
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="flex-1">
          <SocietyPosts societyId={society.id} />
        </TabsContent>
        <TabsContent value="events" className="flex-1">
          <SocietyEvents society={society} />
        </TabsContent>
        <TabsContent value="more-info" className="flex-1">
          <SocietyInfo society={society} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
