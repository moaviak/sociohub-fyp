import { z } from "zod";
import { PostMedium } from "./types";

export const postFormSchema = (
  isUpdate: boolean,
  initialMedia: PostMedium[] = []
) =>
  z
    .object({
      content: z.string().optional(),
      media: z.array(z.instanceof(File)).optional().default([]),
      eventId: z.string().optional(),
      removedMediaIds: z.array(z.string()).optional().default([]),
    })
    .superRefine((data, ctx) => {
      const newMediaCount = data.media?.length || 0;
      const removedMediaIds = data.removedMediaIds || [];
      const removedCount = removedMediaIds.length;
      const remainingExistingMediaCount = Math.max(
        0,
        initialMedia.length - removedCount
      );
      const totalMediaCount = newMediaCount + remainingExistingMediaCount;

      // Validate that removed media IDs actually exist in initial media
      if (isUpdate && removedCount > 0) {
        const initialMediaIds = initialMedia.map((media) => media.id);
        const invalidRemovedIds = removedMediaIds.filter(
          (id) => !initialMediaIds.includes(id)
        );

        if (invalidRemovedIds.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid media IDs in removedMediaIds.",
            path: ["removedMediaIds"],
          });
          return; // Don't proceed with further validation if this fails
        }
      }

      // Ensure at least one media item remains
      if (totalMediaCount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Post must have at least one image or video.",
          path: ["media"],
        });
      }

      // Additional validation: prevent removing more media than exists
      if (isUpdate && removedCount > initialMedia.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cannot remove more media items than exist.",
          path: ["removedMediaIds"],
        });
      }
    });

export type PostFormData = z.infer<ReturnType<typeof postFormSchema>>;
