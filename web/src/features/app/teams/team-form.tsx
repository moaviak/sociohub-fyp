import { useForm } from "react-hook-form";
import { TeamFormData, teamFormSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhotoUpload } from "@/components/photo-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Member, Student } from "@/types";
import { X } from "lucide-react";
import { LeadFlyoutSearch } from "./components/lead-flyout-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCreateTeamMutation, useUpdateTeamMutation } from "./api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { useNavigate } from "react-router";
import { Team } from "./types";

export const TeamForm: React.FC<{ societyId: string; team?: Team }> = ({
  societyId,
  team,
}) => {
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Student | null>(
    team?.lead ?? null
  );
  const [createTeam, { isLoading: isCreateLoading }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdateLoading }] = useUpdateTeamMutation();
  const [shouldDeleteLogo, setShouldDeleteLogo] = useState(false);

  const isLoading = isCreateLoading || isUpdateLoading;

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team?.name ?? "",
      description: team?.description ?? "",
      lead: team?.leadId ?? "",
    },
  });

  const onSubmit = async (data: TeamFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("societyId", societyId);
    formData.append("leadId", data.lead);
    if (data.logo) formData.append("logo", data.logo);
    if (shouldDeleteLogo) formData.append("deleteLogo", "true");

    try {
      if (team) {
        await updateTeam({ teamId: team.id, data: formData }).unwrap();
        toast.success("Team successfully updated");
      } else {
        await createTeam(formData).unwrap();
        toast.success("Team successfully created");
      }
      navigate(`/teams/${societyId}`);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unexpected error occurred.";
      toast.error(message);
    }
  };

  const handleSelectLead = (lead: Member) => {
    setSelectedLead(lead);
    form.setValue("lead", lead.id);
  };

  const handleClearLead = () => {
    setSelectedLead(null);
    form.setValue("lead", "");
  };

  return (
    <div className="lg:w-3xl md:w-xl w-lg mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PhotoUpload
                    onFileSelect={(file: File) => field.onChange(file)}
                    onFileRemove={() => field.onChange(undefined)}
                    initialImage={team?.logo}
                    onInitialImageRemove={() => setShouldDeleteLogo(true)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="outline outline-neutral-400"
                    placeholder="Marketing Team"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none min-h-24 outline outline-neutral-400"
                    placeholder="A brief overview of the team's purpose and responsibilities."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lead"
            render={() => (
              <FormItem>
                <FormLabel>Team Lead</FormLabel>
                <FormControl>
                  {selectedLead ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md shadow w-fit">
                      <div className="flex gap-x-2 items-center">
                        <Avatar>
                          <AvatarImage src={selectedLead.avatar} />
                          <AvatarFallback>
                            {selectedLead.firstName?.charAt(0)}
                            {selectedLead.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="b3-medium">
                            {selectedLead.firstName} {selectedLead.lastName}
                          </p>
                          <p className="b4-regular">
                            {selectedLead.registrationNumber}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                        onClick={() => handleClearLead()}
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <LeadFlyoutSearch
                      societyId={societyId}
                      onSelect={handleSelectLead}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="float-end ">
            <Button disabled={isLoading}>
              {isLoading
                ? team
                  ? "Updating..."
                  : "Creating..."
                : team
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
