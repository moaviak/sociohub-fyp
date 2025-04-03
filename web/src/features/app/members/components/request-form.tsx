import { toast } from "sonner";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import ApiError from "@/features/api-error";
import { Button } from "@/components/ui/button";
import { JoinRequest, RequestAction } from "@/types";

import { useHandleSocietyRequestMutation } from "../api";

interface RequestFormProps {
  request: JoinRequest;
}

export const RequestForm = ({ request }: RequestFormProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [handleSocietyRequest, { isLoading, isError, error }] =
    useHandleSocietyRequestMutation();

  const onAction = async (action: RequestAction) => {
    const response = await handleSocietyRequest({
      societyId: request.societyId,
      studentId: request.studentId,
      action,
    });

    if (!("error" in response)) {
      if (action === RequestAction.ACCEPT) {
        toast.success("Student request has been accepted.");
      } else {
        toast.success("Student request has been rejected.");
      }
      setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-primary-600 h5-semibold">
            Membership Request
          </DialogTitle>
          <DialogDescription>
            Review the membership request from the student and take the suitable
            action.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="flex gap-2">
              <p className="b3-regular">Student Name</p>
              <p className="b3-semibold">{`${request.student.firstName} ${request.student.lastName}`}</p>
            </div>
            <div className="flex gap-2">
              <p className="b3-regular">Registration #</p>
              <p className="b3-semibold">
                {request.student.registrationNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <p className="b3-regular">Email</p>
              <p className="b3-semibold">{request.student.email}</p>
            </div>
            <div className="flex gap-2">
              <p className="b3-regular">Request Date</p>
              <p className="b3-semibold">{formatDate(request.createdAt)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="b3-regular">Reason for joining</p>
            <div className="min-h-20 max-h-20 w-full outline outline-neutral-400 rounded-sm b3-medium px-3 py-2 overflow-y-auto">
              {request.reason}
            </div>
          </div>
          <div className="space-y-1">
            <p className="b3-regular">Expectations from the society</p>
            <div className="min-h-20 max-h-20 w-full outline outline-neutral-400 rounded-sm b3-medium px-3 py-2 overflow-y-auto">
              {request.expectations}
            </div>
          </div>
          <div className="space-y-1">
            <p className="b3-regular">Relevant Skills</p>
            <div className="min-h-12 max-h-12 w-full outline outline-neutral-400 rounded-sm b3-medium px-3 py-2 overflow-y-auto">
              {request.skills}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="success"
            onClick={() => onAction(RequestAction.ACCEPT)}
            disabled={isLoading}
          >
            Accept
          </Button>
          <Button
            variant="destructive"
            onClick={() => onAction(RequestAction.REJECT)}
            disabled={isLoading}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
