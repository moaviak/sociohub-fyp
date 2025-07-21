import { ChatType } from "@prisma/client";
import db from "../db";
import { ApiError } from "../utils/ApiError";
import { deleteFromCloudinary } from "../utils/cloudinary";
import { emitSocketEvent } from "../socket";
import { Request } from "express";

export const getChats = async (userId: string) => {
  const user = await db.user.findFirst({
    where: { OR: [{ studentId: userId }, { advisorId: userId }] },
  });

  if (!user) {
    throw new ApiError(500, "Unexpected error occurred");
  }

  const chats = await db.chat.findMany({
    where: {
      participants: {
        some: {
          id: user.id,
        },
      },
    },
    include: {
      admin: true,
      participants: {
        include: {
          student: true,
          advisor: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          sender: true,
          attachments: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: user.id }, // Exclude user's own messages
              NOT: {
                readBy: {
                  some: {
                    id: user.id,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Sort chats by the most recent message in-memory
  chats.sort((a, b) => {
    const aLastMessage = a.messages[0];
    const bLastMessage = b.messages[0];

    // If both have messages, sort by message timestamp
    if (aLastMessage && bLastMessage) {
      return (
        new Date(bLastMessage.createdAt).getTime() -
        new Date(aLastMessage.createdAt).getTime()
      );
    }

    // If only 'a' has a message, 'a' comes first
    if (aLastMessage) {
      return -1;
    }

    // If only 'b' has a message, 'b' comes first
    if (bLastMessage) {
      return 1;
    }

    // If neither has messages, sort by chat creation time
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return chats.map((chat) => ({
    ...chat,
    unreadCount: chat._count.messages,
  }));
};

export const markChatAsRead = async (chatId: string, userId: string) => {
  const user = await db.user.findFirst({
    where: { OR: [{ studentId: userId }, { advisorId: userId }] },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Find unread messages sent by others
  const unreadMessages = await db.message.findMany({
    where: {
      chatId: chatId,
      senderId: { not: user.id }, // Exclude user's own messages
      NOT: {
        readBy: {
          some: { id: user.id },
        },
      },
    },
    select: { id: true },
  });

  // If no unread messages, do nothing
  if (unreadMessages.length === 0) {
    return { success: true, message: "No new messages to mark as read." };
  }

  // Create an array of update operations to be executed in a transaction
  const updateOperations = unreadMessages.map((message) =>
    db.message.update({
      where: { id: message.id },
      data: {
        readBy: {
          connect: { id: user.id },
        },
      },
    })
  );

  // Execute all updates in a single transaction
  await db.$transaction(updateOperations);

  return { success: true, message: "Chat marked as read" };
};

export const createGroupChat = async (
  name: string,
  adminId: string,
  participantIds: string[],
  avatar?: string
) => {
  const [admin, participants] = await Promise.all([
    db.user.findFirst({
      where: {
        OR: [{ studentId: adminId }, { advisorId: adminId }],
      },
    }),
    db.user.findMany({
      where: {
        OR: [
          {
            advisorId: { in: participantIds },
          },
          {
            studentId: { in: participantIds },
          },
        ],
      },
    }),
  ]);

  if (!admin) {
    throw new ApiError(400, "Invalid admin id");
  }

  if (!participants || participants.length < 1) {
    throw new ApiError(400, "Atleast one participants required.");
  }

  return db.chat.create({
    data: {
      name,
      type: ChatType.GROUP,
      adminId: admin.id,
      chatImage: avatar,
      participants: {
        connect: [...participants, admin].map(({ id }) => ({ id })),
      },
    },
  });
};

export const renameGroupChat = async (
  chatId: string,
  name: string,
  userId: string
) => {
  const chat = await db.chat.findFirst({
    where: {
      id: chatId,
      admin: {
        OR: [{ studentId: userId }, { advisorId: userId }],
      },
    },
  });

  if (!chat) {
    throw new ApiError(403, "You are not authorized to rename this chat.");
  }

  return db.chat.update({
    where: { id: chatId },
    data: { name },
  });
};

export const addParticipant = async (
  chatId: string,
  participantId: string,
  userId: string
) => {
  const [chat, user] = await Promise.all([
    db.chat.findFirst({
      where: {
        id: chatId,
        admin: { OR: [{ advisorId: userId }, { studentId: userId }] },
      },
    }),
    db.user.findFirst({
      where: {
        OR: [{ studentId: participantId }, { advisorId: participantId }],
      },
    }),
  ]);

  if (!chat) {
    throw new ApiError(
      403,
      "You are not authorized to add participants to this chat."
    );
  }

  if (!user) {
    throw new ApiError(500, "Something really gone wrong.");
  }

  return db.chat.update({
    where: { id: chatId },
    data: {
      participants: {
        connect: { id: user.id },
      },
    },
  });
};

export const removeParticipant = async (
  chatId: string,
  participantId: string,
  userId: string
) => {
  const [chat, user] = await Promise.all([
    db.chat.findFirst({
      where: {
        id: chatId,
        admin: {
          OR: [{ studentId: userId }, { advisorId: userId }],
        },
      },
    }),
    db.user.findFirst({
      where: {
        OR: [{ studentId: participantId }, { advisorId: participantId }],
      },
    }),
  ]);

  if (!chat) {
    throw new ApiError(
      403,
      "You are not authorized to remove participants from this chat."
    );
  }

  return db.chat.update({
    where: { id: chatId },
    data: {
      participants: {
        disconnect: { id: user?.id },
      },
    },
  });
};

export const getOneToOneChat = async (userId1: string, userId2: string) => {
  const user1 = await db.user.findFirst({
    where: { OR: [{ studentId: userId1 }, { advisorId: userId1 }] },
  });
  const user2 = await db.user.findFirst({
    where: { OR: [{ studentId: userId2 }, { advisorId: userId2 }] },
  });

  if (!user1 || !user2) {
    throw new ApiError(404, "One or more users not found.");
  }

  // Check if a chat already exists between the two users
  let chat = await db.chat.findFirst({
    where: {
      type: ChatType.ONE_ON_ONE,
      AND: [
        { participants: { some: { id: user1.id } } },
        { participants: { some: { id: user2.id } } },
      ],
    },
  });

  // If no chat exists, create one
  if (!chat) {
    chat = await db.chat.create({
      data: {
        type: ChatType.ONE_ON_ONE,
        participants: {
          connect: [{ id: user1.id }, { id: user2.id }],
        },
      },
    });
  }

  return chat;
};

export const deleteOneToOneChat = async (
  req: Request,
  chatId: string,
  userId: string
) => {
  const chat = await db.chat.findUnique({
    where: { id: chatId, type: "ONE_ON_ONE" },
    include: {
      participants: { select: { id: true, studentId: true, advisorId: true } },
      messages: { select: { attachments: true } },
    },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  // Check if the user is a participant of the chat
  const isParticipant = chat.participants.some(
    (p) => p.studentId === userId || p.advisorId === userId
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not authorized to delete this chat.");
  }

  // Extract all attachment URLs from messages in the chat
  const attachmentUrls: string[] = [];
  chat.messages.forEach((message) => {
    message.attachments.forEach((attachment) => {
      attachmentUrls.push(attachment.url);
    });
  });

  // Delete the chat, which will cascade delete messages and attachments
  await db.chat.delete({
    where: { id: chatId },
  });

  // Queue attachments for background deletion from Cloudinary
  if (attachmentUrls.length > 0) {
    (async () => {
      for (const attachmentUrl of attachmentUrls) {
        await deleteFromCloudinary(attachmentUrl);
      }
    })();
  }

  // Emit socket event to notify participants about chat deletion
  emitSocketEvent(
    req,
    chatId,
    "chat-deleted",
    { chatId: chatId },
    chat.participants,
    userId
  );

  return { success: true, message: "Chat deleted successfully" };
};

export const leaveGroupChat = async (
  req: Request,
  chatId: string,
  userId: string
) => {
  const chat = await db.chat.findUnique({
    where: { id: chatId, type: "GROUP" },
    include: {
      participants: { select: { id: true, studentId: true, advisorId: true } },
    },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  const user = await db.user.findFirst({
    where: { OR: [{ studentId: userId }, { advisorId: userId }] },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the user is a participant of the chat
  const isParticipant = chat.participants.some((p) => p.id === user.id);

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this chat.");
  }

  // Remove the user from the chat's participants
  await db.chat.update({
    where: { id: chatId },
    data: {
      participants: {
        disconnect: { id: user.id },
      },
    },
  });

  // Emit socket event to notify other participants about user leaving
  emitSocketEvent(
    req,
    chatId,
    "group-left",
    { chatId: chatId, userId: user.id },
    chat.participants.filter((p) => p.id !== user.id) // Exclude the user who left
  );

  return { success: true, message: "Left group successfully" };
};

export const deleteGroupChat = async (
  req: Request,
  chatId: string,
  userId: string
) => {
  const chat = await db.chat.findUnique({
    where: { id: chatId, type: "GROUP" },
    include: {
      admin: true,
      messages: { select: { attachments: true } },
      participants: { select: { advisorId: true, studentId: true } },
    },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  // Check if the user is the admin of the chat
  const isAdmin =
    chat.admin?.studentId === userId || chat.admin?.advisorId === userId;

  if (!isAdmin) {
    throw new ApiError(403, "You are not authorized to delete this group.");
  }

  // Extract all attachment URLs from messages in the chat
  const attachmentUrls: string[] = [];
  chat.messages.forEach((message) => {
    message.attachments.forEach((attachment) => {
      attachmentUrls.push(attachment.url);
    });
  });

  // Delete the chat, which will cascade delete messages and attachments
  await db.chat.delete({
    where: { id: chatId },
  });

  // Queue attachments for background deletion from Cloudinary
  if (attachmentUrls.length > 0) {
    (async () => {
      for (const attachmentUrl of attachmentUrls) {
        await deleteFromCloudinary(attachmentUrl);
      }
    })();
  }

  // Emit socket event to notify participants about group deletion
  emitSocketEvent(
    req,
    chatId,
    "group-deleted",
    { chatId: chatId },
    chat.participants,
    userId
  );

  return { success: true, message: "Group deleted successfully" };
};

export const getSuggestedUsers = async (userId: string) => {
  const user = await db.user.findFirst({
    where: { OR: [{ studentId: userId }, { advisorId: userId }] },
  });

  if (!user) {
    throw new ApiError(500, "Unexpected error occurred");
  }

  // Find all one-on-one chats the user is a part of
  const oneOnOneChats = await db.chat.findMany({
    where: {
      type: ChatType.ONE_ON_ONE,
      participants: {
        some: {
          id: user.id,
        },
      },
    },
    include: {
      participants: {
        where: {
          id: { not: user.id }, // Exclude the current user
        },
        include: {
          student: true,
          advisor: true,
        },
      },
    },
  });

  // Extract the other participants from these chats
  const suggestedUsers = oneOnOneChats.flatMap((chat) => chat.participants);

  return suggestedUsers;
};

export const addParticipants = async (
  chatId: string,
  participantIds: string[],
  userId: string
) => {
  const [chat, participants] = await Promise.all([
    db.chat.findFirst({
      where: {
        id: chatId,
        admin: {
          OR: [{ studentId: userId }, { advisorId: userId }],
        },
      },
    }),
    db.user.findMany({
      where: {
        OR: [
          { studentId: { in: participantIds } },
          { advisorId: { in: participantIds } },
        ],
      },
    }),
  ]);

  if (!chat) {
    throw new ApiError(
      403,
      "You are not authorized to add participants to this chat."
    );
  }

  return db.chat.update({
    where: { id: chatId },
    data: {
      participants: {
        connect: participants.map(({ id }) => ({ id })),
      },
    },
  });
};
