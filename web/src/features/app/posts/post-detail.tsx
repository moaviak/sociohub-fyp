import { Navigate, useNavigate } from "react-router";
import { useGetPostByIdQuery } from "./api";
import { PostDetailHeader } from "./components/post-detail/post-detail-header";
import { PostDetailMedia } from "./components/post-detail/post-detail-media";
import { PostHeader } from "./components/post-card/post-header";
import { PostDetailInfo } from "./components/post-detail/post-detail-info";
import { PostDetailActions } from "./components/post-detail/post-detail-actions";
import { PostDetailSkeleton } from "./components/post-detail/post-detail-skeleton";

export const PostDetail: React.FC<{ postId: string }> = ({ postId }) => {
  const { data: post, isLoading } = useGetPostByIdQuery(postId);
  const navigate = useNavigate();

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostDetailHeader />

      <div className="lg:flex lg:h-screen lg:pt-0 space-x-4">
        <PostDetailMedia post={post} />

        <div className="lg:w-[40%] lg:border-l lg:border-gray-200 bg-white">
          <div className="flex flex-col h-full lg:max-h-screen">
            <PostHeader
              post={post}
              onPostDeleted={() => navigate("-1", { replace: true })}
            />
            <PostDetailInfo post={post} />
            <PostDetailActions post={post} />
          </div>
        </div>
      </div>
    </div>
  );
};
