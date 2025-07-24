import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as cmsService from "../services/cms.service";
import { ApiResponse } from "../utils/ApiResponse";
import { IUser } from "../types";

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const post = await cmsService.createPost(
    req.body,
    (req.user as IUser).id,
    files
  );
  res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
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
  const files = req.files as Express.Multer.File[];
  const { removedMediaIds } = req.body;
  const post = await cmsService.updatePost(
    req.params.postId,
    req.body,
    files,
    removedMediaIds ? JSON.parse(removedMediaIds) : undefined
  );
  res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await cmsService.deletePost(req.params.postId);
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

export const deleteComment = asyncHandler(
  async (req: Request, res: Response) => {
    await cmsService.deleteComment(req.params.commentId);
    res
      .status(200)
      .json(new ApiResponse(200, null, "Comment deleted successfully"));
  }
);
