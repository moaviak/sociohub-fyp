import prisma from "../db";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";

export class EventFileService {
  async handleBannerUpload(
    eventId: string,
    banner: string,
    societyName: string
  ) {
    const uploadResult = await uploadOnCloudinary(
      banner,
      `${societyName}/events`
    );
    const bannerUrl = uploadResult?.secure_url;

    await prisma.event.update({
      where: { id: eventId },
      data: { banner: bannerUrl },
    });
  }

  async updateBanner(
    newBanner: string,
    societyName: string,
    oldBanner?: string
  ): Promise<string | undefined> {
    if (oldBanner) {
      await deleteFromCloudinary(oldBanner);
    }
    const uploadResult = await uploadOnCloudinary(
      newBanner,
      `${societyName}/events`
    );

    return uploadResult?.secure_url;
  }
}
