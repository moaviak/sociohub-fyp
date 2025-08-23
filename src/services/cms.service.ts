import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { getLocalPath } from "../utils/helpers";
import {
  createNotification,
  NotificationRecipient,
} from "./notification.service";
import { sendNotificationToUsers } from "../socket";
import { io } from "../app";
import pushNotificationService from "./push-notification.service";

export const createPost = async (
  data: any,
  userId: string,
  files?: Express.Multer.File[]
) => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ studentId: userId }, { advisorId: userId }] },
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong.");
  }

  const post = await prisma.post.create({
    data: { ...data, authorId: user.id },
  });

  if (files && files.length > 0) {
    try {
      const media = await Promise.all(
        files.map(async (file) => {
          const localPath = getLocalPath(file.filename);
          const uploadResult = await uploadOnCloudinary(localPath, "cms_media");

          if (!uploadResult) {
            throw new Error("Failed to upload media");
          }

          return {
            postId: post.id,
            url: uploadResult.secure_url,
            type: file.mimetype.startsWith("image") ? "IMAGE" : "VIDEO",
          };
        })
      );

      await prisma.postMedia.createMany({ data: media });
    } catch (error) {
      // If media upload fails, delete the post
      await prisma.post.delete({ where: { id: post.id } });
      throw new ApiError(500, "Failed to upload media");
    }
  }

  return getPostById(post.id);
};

export const getPostById = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      media: true,
      likes: {
        include: { user: { select: { studentId: true, advisorId: true } } },
      },
      comments: {
        include: { author: { include: { student: true, advisor: true } } },
      },
      author: { include: { student: true, advisor: true } },
      society: true,
      event: true,
    },
  });
  return post;
};

export const getPostsBySociety = async (societyId: string) => {
  const posts = await prisma.post.findMany({
    where: { societyId },
    include: {
      media: true,
      likes: {
        include: { user: { select: { studentId: true, advisorId: true } } },
      },
      comments: true,
      author: { include: { student: true, advisor: true } },
      society: true,
      event: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return posts;
};

export const updatePost = async (
  postId: string,
  data: any,
  files?: Express.Multer.File[],
  removedMediaIds?: string[]
) => {
  // 1. Handle media deletions
  if (removedMediaIds && removedMediaIds.length > 0) {
    const mediaToDelete = await prisma.postMedia.findMany({
      where: {
        id: { in: removedMediaIds },
        postId: postId,
      },
    });

    // Delete from Cloudinary and DB
    await Promise.all(
      mediaToDelete.map(async (media) => {
        await deleteFromCloudinary(media.url);
        await prisma.postMedia.delete({ where: { id: media.id } });
      })
    );
  }

  // 2. Handle new media uploads
  if (files && files.length > 0) {
    const media = await Promise.all(
      files.map(async (file) => {
        const localPath = getLocalPath(file.filename);
        const uploadResult = await uploadOnCloudinary(localPath, "cms_media");

        if (!uploadResult) {
          throw new Error("Failed to upload media");
        }

        return {
          postId: postId,
          url: uploadResult.secure_url,
          type: file.mimetype.startsWith("image") ? "IMAGE" : "VIDEO",
        };
      })
    );

    await prisma.postMedia.createMany({ data: media });
  }

  // 3. Update post content and event link
  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      content: data.content,
      eventId: data.eventId,
    },
  });

  return getPostById(post.id);
};

export const deletePost = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { media: true },
  });

  if (post && post.media.length > 0) {
    await Promise.all(
      post.media.map((media) => deleteFromCloudinary(media.url))
    );
  }

  return await prisma.post.delete({ where: { id: postId } });
};

export const togglePostLike = async (
  postId: string,
  userId: string, // This is studentId or advisorId
  action: "LIKE" | "UNLIKE"
) => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ studentId: userId }, { advisorId: userId }] },
    include: { student: true, advisor: true },
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong.");
  }

  const existingLike = await prisma.postLike.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: user.id,
      },
    },
  });

  if (action === "LIKE") {
    if (existingLike) {
      return existingLike; // Already liked, do nothing
    }

    const newLike = await prisma.postLike.create({
      data: { postId, userId: user.id },
    });

    // Send notification if the liker is not the author of the post
    (async () => {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { author: true },
      });

      if (post && post.authorId !== user.id) {
        const recipient: NotificationRecipient = {
          recipientId: post.author.studentId || post.author.advisorId!,
          recipientType: post.author.studentId ? "student" : "advisor",
          webRedirectUrl: `/posts/${post.id}`,
        };

        const actor = user.advisor || user.student;

        await sendNotification(
          "Someone liked your post",
          `${actor?.firstName} ${actor?.lastName} liked your post`,
          [recipient]
        );
      }
    })();

    return newLike;
  } else if (action === "UNLIKE") {
    if (existingLike) {
      await prisma.postLike.delete({
        where: { postId_userId: { postId, userId: user.id } },
      });
    }
    return null; // Return null whether it existed or not
  }
};

export const addComment = async (
  postId: string,
  userId: string,
  content: string
) => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ studentId: userId }, { advisorId: userId }] },
    include: { student: true, advisor: true },
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong.");
  }

  const comment = await prisma.postComment.create({
    data: { postId, authorId: user.id, content },
  });

  (async () => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (post && post.authorId !== user.id) {
      const recipient: NotificationRecipient = {
        recipientId: post.author.studentId || post.author.advisorId!,
        recipientType: post.author.studentId ? "student" : "advisor",
        webRedirectUrl: `/posts/${post.id}`,
      };

      const actor = user.advisor || user.student;

      await sendNotification(
        "New Comment on Your Post",
        `${actor?.firstName} ${actor?.lastName} commented on your post.`,
        [recipient]
      );
    }
  })();

  return comment;
};

export const getComments = async (postId: string) => {
  const comments = await prisma.postComment.findMany({
    where: { postId },
    include: { author: { include: { advisor: true, student: true } } },
  });

  return comments;
};

export const deleteComment = async (commentId: string) => {
  await prisma.postComment.delete({ where: { id: commentId } });
};

export const sendNotification = async (
  title: string,
  description: string,
  recipients: NotificationRecipient[],
  webRedirectUrl?: string,
  mobileRedirectUrl?: { pathname: string; params: any }
) => {
  const notification = await createNotification({
    title,
    description,
    webRedirectUrl,
    mobileRedirectUrl,
    recipients: recipients,
  });

  if (notification) {
    sendNotificationToUsers(io, recipients, notification);
    pushNotificationService.sendToRecipients(recipients, {
      title: notification.title,
      body: notification.description,
    });
  }
};
