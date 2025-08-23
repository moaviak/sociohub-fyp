import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as cmsService from "../services/cms.service";
import { ApiResponse } from "../utils/ApiResponse";
import { IUser, UserType } from "../types";
import activityService from "../services/activity.service";

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const files = req.files as Express.Multer.File[];
  const post = await cmsService.createPost(req.body, user.id, files);

  if (user.userType === UserType.STUDENT) {
    activityService.createActivityLog({
      studentId: user.id,
      societyId: req.body.societyId,
      action: "Create Post",
      description: `${user.firstName} ${user.lastName} created a new Post for society page.`,
      nature: "CONSTRUCTIVE",
      targetId: post?.id,
      targetType: "Post",
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Post created successfully"));
});

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const post = await cmsService.getPostById(req.params.postId);
  res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));
});

export const getPostsBySociety = asyncHandler(
  async (req: Request, res: Response) => {
    const posts = await cmsService.getPostsBySociety(req.params.societyId);
    res
      .status(200)
      .json(new ApiResponse(200, posts, "Posts fetched successfully"));
  }
);

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const files = req.files as Express.Multer.File[];
  const { removedMediaIds } = req.body;

  const post = await cmsService.updatePost(
    req.params.postId,
    req.body,
    files,
    removedMediaIds ? JSON.parse(removedMediaIds) : undefined
  );

  if (user.userType === UserType.STUDENT && !!post) {
    activityService.createActivityLog({
      studentId: user.id,
      societyId: post.societyId,
      action: "Update Post",
      description: `${user.firstName} ${user.lastName} updated a post at society page.`,
      nature: "NEUTRAL",
      targetId: post?.id,
      targetType: "Post",
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post updated successfully"));
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const post = await cmsService.deletePost(req.params.postId);

  if (user.userType === UserType.STUDENT && post) {
    activityService.createActivityLog({
      studentId: user.id,
      societyId: post.societyId,
      action: "Delete Post",
      description: `${user.firstName} ${user.lastName} deleted a Post from society page.`,
      nature: "DESTRUCTIVE",
      targetId: post.id,
      targetType: "Post",
    });
  }

  res.status(200).json(new ApiResponse(200, null, "Post deleted successfully"));
});

export const togglePostLike = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { action } = req.body;
    const result = await cmsService.togglePostLike(
      req.params.postId,
      user.id,
      action
    );
    res.status(200).json(new ApiResponse(200, result, "Success"));
  }
);

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { content } = req.body;
  const comment = await cmsService.addComment(
    req.params.postId,
    user.id,
    content
  );
  res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await cmsService.getComments(req.params.postId);
  res.status(201).json(new ApiResponse(200, comments));
});

export const deleteComment = asyncHandler(
  async (req: Request, res: Response) => {
    await cmsService.deleteComment(req.params.commentId);
    res
      .status(200)
      .json(new ApiResponse(200, null, "Comment deleted successfully"));
  }
);
