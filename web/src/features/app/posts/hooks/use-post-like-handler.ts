import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/app/hooks";
import { useTogglePostLikeMutation } from "@/features/app/posts/api";
import { Post } from "../types";

export const usePostLikeHandler = (post: Post) => {
  const currentUser = useAppSelector((state) => state.auth.user);

  const initialIsLiked = post.likes.some(
    (like) =>
      like.user.advisorId === currentUser!.id ||
      like.user.studentId === currentUser!.id
  );
  const initialLikesCount = post.likes.length;

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikesCount);

  const [togglePostLike] = useTogglePostLikeMutation();

  const currentLikedState = useRef(initialIsLiked);
  const serverLikedState = useRef(initialIsLiked);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsLiked(
      post.likes.some(
        (like) =>
          like.user.advisorId === currentUser!.id ||
          like.user.studentId === currentUser!.id
      )
    );
  }, [currentUser, post.likes]);

  useEffect(() => {
    currentLikedState.current = isLiked;
  }, [isLiked]);

  useEffect(() => {
    const newIsLiked = post.likes.some(
      (like) =>
        like.user.advisorId === currentUser!.id ||
        like.user.studentId === currentUser!.id
    );
    const newLikesCount = post.likes.length;

    if (newIsLiked !== serverLikedState.current) {
      setIsLiked(newIsLiked);
      setLikes(newLikesCount);
      serverLikedState.current = newIsLiked;
      currentLikedState.current = newIsLiked;
    }
  }, [currentUser, post.likes]);

  const syncWithServer = async () => {
    const finalState = currentLikedState.current;

    if (finalState !== serverLikedState.current) {
      try {
        await togglePostLike({
          postId: post.id,
          action: finalState ? "LIKE" : "UNLIKE",
        }).unwrap();
        serverLikedState.current = finalState;
      } catch (error) {
        console.error("Failed to sync like state:", error);
        setIsLiked(serverLikedState.current);
        setLikes((prev) => (serverLikedState.current ? prev + 1 : prev - 1));
        currentLikedState.current = serverLikedState.current;
      }
    }
  };

  const handleLike = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes((prev) => (newIsLiked ? prev + 1 : prev - 1));

    debounceTimer.current = setTimeout(() => {
      syncWithServer();
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        if (currentLikedState.current !== serverLikedState.current) {
          syncWithServer();
        }
      }
    };
  }, []);

  return { isLiked, likes, handleLike };
};
