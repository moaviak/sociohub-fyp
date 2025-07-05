import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { JoinWithCodeData, joinWithCodeSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useJoinByCodeMutation } from "./api";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ApiError from "@/features/api-error";

export const JoinWithCode = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [joinByCode, { isLoading }] = useJoinByCodeMutation();

  const form = useForm<JoinWithCodeData>({
    resolver: zodResolver(joinWithCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleSubmit = async (data: JoinWithCodeData) => {
    try {
      const response = await joinByCode({ code: data.code }).unwrap();

      if (!("error" in response)) {
        const { dailyRoomUrl, dailyToken, meeting: meetingInfo } = response;

        // Set credentials in session storage
        localStorage.setItem(
          `meeting-credentials-${meetingInfo.id}`,
          JSON.stringify({ dailyRoomUrl, dailyToken })
        );

        navigate(`/meeting-room/${meetingInfo.id}`);

        toast.success("Ready to join meeting!");
      } else {
        throw response;
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to join meeting";

      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Keyboard className="w-4 h-4" />
          Join with Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg flex flex-col gap-y-4 min-h-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-600 h6-semibold">
            Join Meeting with Code
          </DialogTitle>
          <DialogDescription className="b4-regular">
            Enter a unique meeting code provided by meeting host to join the
            meeting.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="outline outline-neutral-400"
                      placeholder="XXXXXXXX"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="float-end" disabled={isLoading}>
              {isLoading ? "Joining" : "Join Meeting"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
