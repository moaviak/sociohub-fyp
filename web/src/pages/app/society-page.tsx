import { Society } from "@/features/app/society";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { Navigate } from "react-router";

const SocietyPage = () => {
  const societyId = useGetSocietyId();

  if (!societyId) {
    return <Navigate to={"/dashboard"} />;
  }

  return <Society id={societyId} />;
};
export default SocietyPage;
