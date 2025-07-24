import { PostForm } from "./post-form";
import { Post } from "./types";

export const CreatePost: React.FC<{ societyId: string; post?: Post }> = ({
  societyId,
  post,
}) => {
  return (
    <div className="w-full my-4">
      <PostForm societyId={societyId} post={post} />
    </div>
  );
};
