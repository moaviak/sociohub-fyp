import { useAppSelector } from "@/app/hooks";
import { CreatePost } from "@/features/app/posts/create-post";
import { haveContentsPrivilege } from "@/lib/utils";
import { Advisor } from "@/types";
import { Navigate, useLocation, useParams } from "react-router";

const CreatePostPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { societyId } = useParams();
  const { state } = useLocation();

  const isStudent = user && "registrationNumber" in user;

  const havePrivilege = isStudent
    ? haveContentsPrivilege(user.societies || [], societyId || "")
    : !societyId || societyId === (user as Advisor).societyId;

  if (!havePrivilege) {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <div className="flex flex-col px-4 py-2">
      <h3 className="h4-semibold">
        {state?.post ? "Update Post" : "Create New Post"}
      </h3>

      <div className="flex-1 flex">
        <CreatePost
          societyId={societyId || (user as Advisor).societyId!}
          post={state?.post}
        />
      </div>
    </div>
  );
};
export default CreatePostPage;
