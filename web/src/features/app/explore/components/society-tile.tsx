import { toast } from "sonner";
import { useEffect } from "react";

import { Society } from "@/types";
import ApiError from "@/features/api-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useCancelJoinRequestMutation } from "../api";
import { RegistrationForm } from "./registration-form";
import { Link } from "react-router";

interface SocietyProps {
  society: Society;
}

export const SocietyTile = ({ society }: SocietyProps) => {
  const [cancelJoinRequest, { isLoading, isError, error }] =
    useCancelJoinRequestMutation();

  const onCancelRequest = async () => {
    const response = await cancelJoinRequest({ societyId: society.id });

    if (!("error" in response)) {
      toast.success("Request successfully cancelled.");
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as ApiError)?.errorMessage || "An unexpected error occurred",
        {
          duration: 10000,
        }
      );
    }
  }, [isError, error]);

  return (
    <div className="flex flex-col items-center text-center p-4 gap-y-4 rounded-md drop-shadow-md bg-white">
      <img
        src={society.logo || "/assets/images/society-placeholder.png"}
        className="rounded-full w-12 h-12"
      />
      <Link
        to={`/society/${society.id}`}
        className="space-y-2 flex-1 overflow-hidden max-h-80"
      >
        <h6 className="h6-semibold">{society.name}</h6>
        <p className="b3-regular overflow-ellipsis line-clamp-5">
          {society.description}
        </p>
      </Link>
      {!society.acceptingNewMembers ? (
        <></>
      ) : society.isMember || society.hasRequestedToJoin ? (
        <Button
          variant={society.hasRequestedToJoin ? "destructive" : "outline"}
          disabled={society.isMember || isLoading}
          className="w-full"
          onClick={onCancelRequest}
        >
          {society.hasRequestedToJoin ? "Cancel Request" : "Joined"}
        </Button>
      ) : (
        <RegistrationForm society={society} />
      )}
    </div>
  );
};

SocietyTile.Skeleton = function () {
  return (
    <div className="flex flex-col items-center text-center p-4 gap-y-4">
      <Skeleton className="rounded-full w-12 h-12" />
      <div className="space-y-2 flex-1 overflow-hidden max-h-80 flex flex-col items-center">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-80" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
};
