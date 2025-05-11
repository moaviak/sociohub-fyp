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
import { cn, formatDate } from "@/lib/utils";
import ApiError from "@/features/api-error";
import { Button } from "@/components/ui/button";
import { JoinRequest, JoinRequestStatus, RequestAction } from "@/types";

import { useHandleSocietyRequestMutation } from "../api";
import { CloudDownload } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { REJECT_REASONS } from "@/data";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RequestFormProps {
  request: JoinRequest;
}

export const RequestForm = ({ request }: RequestFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const [handleSocietyRequest, { isLoading, isError, error }] =
    useHandleSocietyRequestMutation();

  const onAction = async (action: RequestAction, reason?: string) => {
    const response = await handleSocietyRequest({
      societyId: request.societyId,
      studentId: request.studentId,
      action,
      reason, // Add reason if rejecting
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

  // When the reject dialog opens, close the main dialog
  useEffect(() => {
    if (isRejectOpen) {
      setIsOpen(false);
    }
  }, [isRejectOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            View Request
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl flex flex-col gap-y-4 min-h-0 max-h-[90vh] overflow-hidden">
          {request.status !== JoinRequestStatus.PENDING && (
            <div
              className={cn(
                "absolute z-10 top-14 right-10 border-3 h5-semibold px-2 rotate-[30deg]",
                request.status === JoinRequestStatus.APPROVED
                  ? "border-emerald-600 text-emerald-600"
                  : "border-red-600 text-red-600"
              )}
            >
              {request.status}
            </div>
          )}
          <DialogHeader className="px-4">
            <DialogTitle className="text-primary-600 h5-semibold">
              Membership Request
            </DialogTitle>
            <DialogDescription>
              Review the membership request from the student and take the
              suitable action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto custom-scrollbar px-4 py-2">
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

            {request.status === JoinRequestStatus.REJECTED && (
              <div className="space-y-1">
                <p className="b3-regular">Rejection Reason</p>
                <div className="min-h-20 max-h-20 w-full outline outline-neutral-400 rounded-sm b3-medium px-3 py-2 overflow-y-auto">
                  {request.rejectionReason}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <p className="b3-regular">WhatsApp Number</p>
              <div className="w-full outline outline-neutral-400 rounded-sm b3-medium px-3 py-2 overflow-y-auto">
                {request.whatsappNo}
              </div>
            </div>
            <div className="space-y-1">
              <p className="b3-regular">Semester</p>
              <div className="w-full outline outline-neutral-400 rounded-sm b3-medium px-3 py-2 overflow-y-auto">
                {request.semester}
              </div>
            </div>
            <div className="space-y-1">
              <p className="b3-regular">Interested Role</p>
              <div className="w-full outline outline-neutral-400 rounded-sm b3-medium px-3 py-2 overflow-y-auto">
                {request.interestedRole?.name || "Not specified"}
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
          <DialogFooter
            className={cn(
              "flex w-full",
              request.status === JoinRequestStatus.PENDING && "justify-between!"
            )}
          >
            {request.pdf && (
              <a href={request.pdf} target="_blank">
                <Button className="items-center">
                  <CloudDownload className="text-white h-5 w-5" />
                  Download PDF
                </Button>
              </a>
            )}
            {request.status === JoinRequestStatus.PENDING && (
              <div className="space-x-2">
                <Button
                  variant="success"
                  onClick={() => onAction(RequestAction.ACCEPT)}
                  disabled={isLoading}
                >
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsRejectOpen(true);
                  }}
                  disabled={isLoading}
                >
                  Reject
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Separate RejectRequest component */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-2xl flex flex-col min-h-0 max-h-[90vh] overflow-hidden">
          <DialogHeader className="px-4">
            <DialogTitle className="text-primary-600 h5-semibold">
              Are you sure you want to reject this request?
            </DialogTitle>
            <DialogDescription>
              Please select a reason for rejection from the list below:
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto custom-scrollbar px-4 py-2">
            <RejectRequestContent
              onCancel={() => {
                setIsRejectOpen(false);
                setIsOpen(true); // Reopen the main dialog
              }}
              onSubmit={async (reason: string) => {
                await onAction(RequestAction.REJECT, reason);
                setIsRejectOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Extracted the content portion to a separate component
interface RejectRequestContentProps {
  onCancel: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

const RejectRequestContent = ({
  onCancel,
  onSubmit,
}: RejectRequestContentProps) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Update selectedReason whenever selectedValue or otherReason changes
  useEffect(() => {
    if (selectedValue === "Other") {
      setSelectedReason(otherReason);
    } else {
      setSelectedReason(selectedValue);
    }
  }, [selectedValue, otherReason]);

  const handleSubmit = async () => {
    setFormError("");
    setIsSubmitting(true);

    // Validation: if "Other" is selected, require text in textarea
    if (selectedValue === "Other" && !otherReason.trim()) {
      setFormError("Please specify your reason");
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(selectedReason);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <>
      <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
        {REJECT_REASONS.map((reason, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 py-1 rounded-md border cursor-pointer transition-colors"
          >
            <RadioGroupItem
              value={reason.description}
              id={`reject-reason-${idx}`}
            />
            <Label
              htmlFor={`reject-reason-${idx}`}
              className="flex-1 cursor-pointer"
            >
              <p className="b2-medium">{reason.title}</p>
              <p className="b4-regular text-muted-foreground">
                {reason.description}
              </p>
            </Label>
          </div>
        ))}

        <div>
          <div className="flex items-center gap-3 py-1 rounded-md border cursor-pointer transition-colors">
            <RadioGroupItem value="Other" id="reject-reason-other" />
            <Label htmlFor="reject-reason-other" className="b2-medium">
              Other
            </Label>
          </div>
          {selectedValue === "Other" && (
            <div className="mt-2">
              <Textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Please specify your reason"
                className={`min-h-20 resize-none outline ${
                  formError ? "outline-red-500" : "outline-neutral-400 outline"
                }`}
              />
              {formError && (
                <p className="text-red-500 text-sm mt-1">{formError}</p>
              )}
            </div>
          )}
        </div>
      </RadioGroup>

      <DialogFooter className="my-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="destructive"
          onClick={handleSubmit}
          disabled={!selectedValue || isSubmitting}
        >
          Confirm
        </Button>
      </DialogFooter>
    </>
  );
};
