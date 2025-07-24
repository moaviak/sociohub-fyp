import React from "react";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Post } from "../../types";
import { haveContentsPrivilege, multiFormatDateString } from "@/lib/utils";
import { Link } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { Advisor } from "@/types";
import { useDeletePostMutation } from "../../api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";

interface PostHeaderProps {
  post: Post;
  onPostDeleted?: () => void; // New optional prop
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  onPostDeleted,
}) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  const isStudent = currentUser && "registrationNumber" in currentUser;
  const havePrivilege = isStudent
    ? haveContentsPrivilege(currentUser!.societies || [], post.societyId)
    : post.societyId === (currentUser as Advisor).societyId;

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post.id, societyId: post.societyId }).unwrap();
      toast.success("Post deleted successfully.");
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to delete post.";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <Avatar className="size-10">
          <AvatarImage
            src={post.society.logo || "/assets/images/society-placeholder.png"}
            alt={post.society.name}
          />
          <AvatarFallback className="bg-gray-200 text-gray-600 b3-medium">
            {post.society.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col ml-2">
          <span className="font-semibold text-sm text-gray-900">
            {post.society.name}
          </span>
          <span className="text-xs text-gray-500">
            {multiFormatDateString(post.createdAt)}
          </span>
        </div>
      </div>

      {havePrivilege && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal size={20} className="text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/create-post`} state={{ post }}>
                <Edit className="size-4 mr-2" />
                Edit Post
              </Link>
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                >
                  <Trash2 className="size-4 mr-2 text-red-500" />
                  <span className="text-red-500">Delete Post</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your post and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant={"destructive"}
                    asChild
                  >
                    <AlertDialogAction>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
