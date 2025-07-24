import { useGetSocietyPostsQuery } from "./api";
import { PostCard, PostCardSkeleton } from "./components/post-card";

export const SocietyPosts: React.FC<{ societyId: string }> = ({
  societyId,
}) => {
  const { data: posts, isLoading } = useGetSocietyPostsQuery(societyId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return <div>No posts found.</div>;
  }

  return (
    <div className="space-y-4 p-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
