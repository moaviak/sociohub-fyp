import { Event, Society } from "@/types";
import { IUser } from "../chats/types";

export interface Base {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post extends Base {
  content: string;
  authorId: string;
  societyId: string;
  eventId?: string;
  event?: Event;
  media?: PostMedium[];
  society: Society;
  likes: PostLike[];
  comments: PostComment[];
}

export interface PostMedium extends Base {
  url: string;
  postId: string;
  type: "IMAGE" | "VIDEO";
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  user: { studentId: string; advisorId: string };
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  author: IUser;
  content: string;
  createdAt: string;
}
