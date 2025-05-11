import { Button } from "@/components/ui/button";
import { JoinRequest } from "@/types";
import { useDeleteRequestMutation } from "../api";
import { useEffect } from "react";
import { toast } from "sonner";

interface DeleteRequestProps {
  request: JoinRequest;
}

export const DeleteRequest = ({ request }: DeleteRequestProps) => {
  const [deleteRequest, { isLoading, isError }] = useDeleteRequestMutation();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to delete request. Please try again.");
    }
  }, [isError]);

  const handleDelete = async () => {
    const response = await deleteRequest({
      requestId: request.id,
      societyId: request.societyId,
    });

    if (!("error" in response)) {
      toast.success("Request deleted successfully.");
    }
  };

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={isLoading}
      onClick={handleDelete}
    >
      Delete
    </Button>
  );
};
