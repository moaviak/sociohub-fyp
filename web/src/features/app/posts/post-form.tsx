import { useForm } from "react-hook-form";
import { PostFormData, postFormSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { EventFlyoutSearch } from "./components/event-flyout-search";
import { Event } from "@/types";
import { X } from "lucide-react";
import { useState } from "react";
import { formatEventDateTime } from "@/lib/utils";

import { useCreatePostMutation, useUpdatePostMutation } from "./api";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { Post } from "./types";

export const PostForm: React.FC<{ societyId: string; post?: Post }> = ({
  societyId,
  post,
}) => {
  const navigate = useNavigate();

  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema(!!post, post?.media || [])),
    defaultValues: {
      content: post?.content ?? "",
      media: [],
      removedMediaIds: [],
    },
  });

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(
    post?.event ?? null
  );

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  const handleSubmit = async (data: PostFormData) => {
    const formData = new FormData();
    if (data.content) formData.append("content", data.content);
    formData.append("societyId", societyId);

    if (data.eventId) {
      formData.append("eventId", data.eventId);
    } else if (post?.eventId) {
      // If event was previously linked but now cleared
      formData.append("eventId", ""); // Send empty string to clear eventId
    }

    if (data.media) {
      data.media.forEach((file) => {
        formData.append("media", file);
      });
    }

    if (data.removedMediaIds && data.removedMediaIds.length > 0) {
      formData.append("removedMediaIds", JSON.stringify(data.removedMediaIds));
    }

    try {
      let response: Post;
      if (post) {
        // Update existing post
        response = await updatePost({
          postId: post.id,
          data: formData,
        }).unwrap();
        toast.success("Post successfully updated.");
      } else {
        // Create new post
        response = await createPost(formData).unwrap();
        toast.success("Post successfully created.");
      }
      console.log(response);
      form.reset();
      navigate(`/posts/${response.id}`);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unexpected error occurred.";
      toast.error(message);
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    form.setValue("eventId", event.id);
  };

  const handleClearEvent = () => {
    setSelectedEvent(null);
    form.setValue("eventId", undefined);
  };

  const handleRemoteImageRemove = ({ id }: { id?: string }) => {
    if (id) {
      const currentRemovedIds = form.getValues("removedMediaIds") || [];
      const updatedRemovedIds = [...currentRemovedIds, id];
      form.setValue("removedMediaIds", updatedRemovedIds);

      // Trigger validation to check if we still have enough media
      form.trigger(["media", "removedMediaIds"]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Content</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="resize-none min-h-16 outline outline-neutral-400"
                  placeholder="Start writing your post content here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="media"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Media</FormLabel>
              <FormControl>
                <FileUploader
                  onFilesChange={(files) => {
                    field.onChange(files);
                    // Trigger validation when files change
                    form.trigger(["media", "removedMediaIds"]);
                  }}
                  onRemoteImageRemove={handleRemoteImageRemove}
                  placeholderText={{
                    main: "Drag your images and videos or",
                    browse: "browse",
                    sizeLimit: "Max size: 10 MB",
                  }}
                  maxSize={10 * 1024 * 1024}
                  enableMultipleUploads
                  acceptVideos
                  maxFiles={5}
                  existingImages={post?.media}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hidden field for removedMediaIds - this ensures it's part of the form data */}
        <FormField
          control={form.control}
          name="removedMediaIds"
          render={() => <></>}
        />

        <FormField
          control={form.control}
          name="eventId"
          render={() => (
            <FormItem>
              <FormLabel>Connect to Event (Optional)</FormLabel>
              <FormControl>
                {selectedEvent ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md shadow w-fit">
                    <div className="flex flex-col">
                      <span className="b2-medium">{selectedEvent.title}</span>
                      <span className="b4-regular">
                        {formatEventDateTime(
                          selectedEvent.startDate!,
                          selectedEvent.endDate!,
                          selectedEvent.startTime!,
                          selectedEvent.endTime!
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                      onClick={() => handleClearEvent()}
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <EventFlyoutSearch
                    societyId={societyId}
                    onSelect={handleSelectEvent}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="float-end my-4">
          <Button disabled={isCreating || isUpdating}>
            {post
              ? !isUpdating
                ? "Update Post"
                : "Updating..."
              : !isCreating
              ? "Create Post"
              : "Creating..."}
          </Button>
        </div>
      </form>
    </Form>
  );
};
