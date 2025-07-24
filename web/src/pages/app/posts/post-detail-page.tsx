import { PostDetail } from "@/features/app/posts/post-detail";
import { Navigate, useParams } from "react-router";

const PostDetailPage = () => {
  const { postId } = useParams();

  if (!postId) {
    return <Navigate to={"/dashboard"} />;
  }

  return <PostDetail postId={postId} />;
};
export default PostDetailPage;
