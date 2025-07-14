import { EventAudience, EventType, EventVisibility } from "@prisma/client";
import prisma from "../db";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { ApiError } from "../utils/ApiError";

export class EventDraftService {
  async saveDraft(
    input: any,
    societyId: string,
    formStep: number,
    eventId?: string
  ) {
    try {
      const defaultData = {
        title: "",
        categories: [],
        startDate: new Date(),
        endDate: new Date(),
        startTime: "00:00",
        endTime: "00:00",
        eventType: EventType.Physical,
        audience: EventAudience.Open,
        visibility: EventVisibility.Draft,
      };

      const data = {
        ...defaultData,
        ...input,
        societyId,
        formStep,
        isDraft: true,
      };

      let updatedDraft;
      if (eventId) {
        // Update existing draft
        updatedDraft = await prisma.event.update({
          where: { id: eventId },
          data,
        });

        // Handle banner replacement in background
        if (input.banner) {
          (async () => {
            // Fetch previous draft to get old banner
            const prevDraft = await prisma.event.findUnique({
              where: { id: eventId },
            });
            if (
              prevDraft &&
              prevDraft.banner &&
              prevDraft.banner !== input.banner
            ) {
              try {
                await deleteFromCloudinary(prevDraft.banner);
              } catch (e) {
                // Log error but do not block
              }
            }
            // Upload new banner
            try {
              const society = await prisma.society.findUnique({
                where: { id: societyId },
              });
              if (society) {
                const uploadResult = await uploadOnCloudinary(
                  input.banner!,
                  `${society.name}/events`
                );
                if (uploadResult?.secure_url) {
                  await prisma.event.update({
                    where: { id: eventId },
                    data: { banner: uploadResult.secure_url },
                  });
                }
              }
            } catch (e) {
              // Log error but do not block
            }
          })();
        }
        return updatedDraft;
      } else {
        // Create new draft
        const createdDraft = await prisma.event.create({
          data,
        });
        // Handle banner upload in background
        if (input.banner) {
          (async () => {
            try {
              const society = await prisma.society.findUnique({
                where: { id: societyId },
              });
              if (society) {
                const uploadResult = await uploadOnCloudinary(
                  input.banner!,
                  `${society.name}/events`
                );
                if (uploadResult?.secure_url) {
                  await prisma.event.update({
                    where: { id: createdDraft.id },
                    data: { banner: uploadResult.secure_url },
                  });
                }
              }
            } catch (e) {
              // Log error but do not block
            }
          })();
        }
        return createdDraft;
      }
    } catch (error: any) {
      throw new ApiError(500, "Error saving draft: " + error.message);
    }
  }

  async getDraft(eventId: string, societyId: string) {
    try {
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          societyId,
          isDraft: true,
        },
      });

      if (!event) {
        throw new ApiError(404, "Draft not found");
      }

      return event;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Error fetching draft: " + error.message);
    }
  }

  async getDrafts(societyId: string) {
    try {
      return await prisma.event.findMany({
        where: {
          societyId,
          isDraft: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } catch (error: any) {
      throw new ApiError(500, "Error fetching drafts: " + error.message);
    }
  }
}
