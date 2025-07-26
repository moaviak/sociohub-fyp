import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CheckCircle2, UserCheck, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetTeamJoinRequestsQuery,
  useApproveJoinRequestMutation,
  useRejectJoinRequestMutation,
} from "../api";
import { useAppSelector } from "@/app/hooks";
import { toast } from "sonner";
import { Link } from "react-router";

export const RequestsModal: React.FC<{
  teamId: string;
  requestsCount: number;
}> = ({ teamId, requestsCount }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: requests, isLoading } = useGetTeamJoinRequestsQuery(teamId);
  const [approveRequest, { isLoading: isApprovingRequest }] =
    useApproveJoinRequestMutation();
  const [rejectRequest, { isLoading: isRejectingRequest }] =
    useRejectJoinRequestMutation();

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest({
        requestId,
        respondedById: user?.id as string,
      }).unwrap();
      toast.success("The join request has been approved successfully.");
    } catch (error) {
      toast.error("Failed to approve the join request.");
      console.error("Error approving join request:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest({
        requestId,
        respondedById: user?.id as string,
      }).unwrap();
      toast.success("The join request has been rejected.");
    } catch (error) {
      toast.error("Failed to reject the join request.");
      console.error("Error rejecting join request:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCheck className="mr-1 h-4 w-4" />
          {`Join Requests (${requestsCount})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] overflow-y-auto custom-scrollbar scroll-m-0.5 flex flex-col">
        <DialogHeader>
          <DialogTitle>Team Join Requests</DialogTitle>
          <DialogDescription>
            View and manage team join requests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 h-full">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            ))
          ) : requests?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending join requests.
            </div>
          ) : (
            requests?.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-2 border rounded-lg bg-card"
              >
                <Link to={`/profile/${request.student.id}`}>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-10">
                      <AvatarImage src={request.student.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {request.student.firstName![0]}
                        {request.student.lastName![0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="b2-medium">
                        {request.student.firstName} {request.student.lastName}
                      </h4>
                      <p className="b4-regular text-muted-foreground">
                        Requested {format(new Date(request.createdAt), "PPp")}
                      </p>
                      {request.message && (
                        <p className="text-sm mt-1 text-muted-foreground">
                          "{request.message}"
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleApprove(request.id)}
                    disabled={isApprovingRequest || isRejectingRequest}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleReject(request.id)}
                    disabled={isApprovingRequest || isRejectingRequest}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
