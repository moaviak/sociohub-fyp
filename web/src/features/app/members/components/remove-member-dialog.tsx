import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { REMOVAL_REASONS } from "@/data";
import { useRemoveMemberMutation } from "../api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { Member } from "@/types";

interface RemoveMemberDialogProps {
  member: Member;
  onClose?: () => void;
}

export const RemoveMemberDialog = ({
  member,
  onClose,
}: RemoveMemberDialogProps) => {
  const [isOpen, setIsOpen] = useState(onClose ? true : false);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [formError, setFormError] = useState("");

  const [removeMember, { isLoading, isError, error }] =
    useRemoveMemberMutation();
  const societyId = useGetSocietyId();

  useEffect(() => {
    if (selectedValue === "Other") {
      setSelectedReason(otherReason);
    } else {
      setSelectedReason(selectedValue);
    }
  }, [selectedValue, otherReason]);

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

  if (!societyId) return;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setFormError("");

    // Validation: if "Other" is selected, require text in textarea
    if (selectedValue === "Other" && !otherReason.trim()) {
      setFormError("Please specify your reason");
      return;
    }

    try {
      const response = await removeMember({
        societyId,
        studentId: member.id,
        reason: selectedReason,
      });

      if (!("error" in response)) {
        toast.success("Student has been removed from the society");
        setIsOpen(false);
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!onClose && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="inline" className="text-red-600">
            Remove Member
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-2xl flex flex-col min-h-0 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        <DialogHeader className="px-4">
          <DialogTitle className="text-primary-600 h5-semibold">
            Are you sure you want to remove this member?
          </DialogTitle>
          <DialogDescription>
            Please select a reason for removal from the list below:
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto custom-scrollbar px-4 py-2">
          <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
            {REMOVAL_REASONS.map((reason, idx) => (
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
              </div>{" "}
              {selectedValue === "Other" && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <Textarea
                    value={otherReason}
                    onChange={(e) => {
                      setOtherReason(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    placeholder="Please specify your reason"
                    className={`min-h-20 resize-none outline ${
                      formError ? "outline-red-500" : "outline-neutral-400"
                    }`}
                  />
                  {formError && (
                    <p className="text-red-500 text-sm mt-1">{formError}</p>
                  )}
                </div>
              )}
            </div>
          </RadioGroup>
        </div>
        <DialogFooter className="my-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!selectedValue || isLoading}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
