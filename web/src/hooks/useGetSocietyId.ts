import { useParams } from "react-router";

import { useAppSelector } from "@/app/hooks";

const useGetSocietyId = () => {
  const { societyId } = useParams();
  const { user } = useAppSelector((state) => state.auth);

  let id = societyId;

  if (user && "societyId" in user) {
    id = id || user.societyId;
  }

  return id;
};

export default useGetSocietyId;
