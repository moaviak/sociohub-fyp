import { useAppSelector } from "@/store/hooks";
import { useLocalSearchParams } from "expo-router";

const useGetSocietyId = () => {
  const { societyId } = useLocalSearchParams<{ societyId?: string }>();
  const { user } = useAppSelector((state) => state.auth);

  let id = societyId;

  if (user && "societyId" in user) {
    id = id || user.societyId;
  }

  return id || "";
};

export default useGetSocietyId;
