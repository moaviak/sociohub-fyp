import { SpinnerLoader } from "@/components/spinner-loader";
import { useGetUserByIdQuery } from "./api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit, IdCard, Mail, Phone, User } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { RolesBadges } from "../members/components/roles-badges";
import { Link } from "react-router";
import { UserMenu } from "../explore/components/user-menu";

interface UserProfileProps {
  id: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ id }) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetUserByIdQuery({ id });

  if (isLoading) {
    return (
      <div className="h-full flex justify-center items-center">
        <SpinnerLoader size="md" />
      </div>
    );
  }

  const user = data && !("error" in data) ? data : undefined;

  if (!user) {
    toast.error("Something went wrong, please refresh the page.");
    return null;
  }

  return (
    <div>
      <div className="w-full h-52 rounded-t-2xl overflow-hidden">
        <img
          src="/assets/images/profile-bg.jpeg"
          alt="profile background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full relative -top-16 space-y-6">
        <div className="px-8 flex justify-between items-center">
          <div className="flex flex-col justify-center items-center gap-2">
            <img
              src={user.avatar || "/assets/images/user-placeholder.png"}
              alt="profile"
              className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="text-center">
              <p className="b1-bold">{`${user.firstName} ${user.lastName}`}</p>
              <p className="b3-regular">
                {"registrationNumber" in user ? "Student" : "Advisor"}
              </p>
            </div>
          </div>
          {currentUser?.id === user.id ? (
            <Button variant={"outline"} asChild>
              <Link to="/user-settings/profile">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          ) : (
            <UserMenu user={user} variant="profile" />
          )}
        </div>

        <div className="space-y-4">
          <h5 className="h6-semibold">Personal Information</h5>
          <div className="space-y-2 px-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-neutral-950" />
              <p className="b2-semibold text-neutral-950">Email</p>
              <p className="b2-regular text-neutral-700">{user.email}</p>
            </div>
            {"registrationNumber" in user && (
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-neutral-950" />
                <p className="b2-semibold text-neutral-950">
                  Registration Number
                </p>
                <p className="b2-regular text-neutral-700">
                  {user.registrationNumber}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-950" />
              <p className="b2-semibold text-neutral-950">Bio</p>
              <p className="b2-regular text-neutral-700">{user.bio || "N/A"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-neutral-950" />
              <p className="b2-semibold text-neutral-950">Email</p>
              <p className="b2-regular text-neutral-700">
                {user.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {"registrationNumber" in user ? (
          <div className="space-y-4">
            <h5 className="h6-semibold">Joined Societies</h5>
            <div className="px-2">
              {user.societies && user.societies.length > 0 ? (
                <ul className="space-y-2">
                  {user.societies.map(({ society, roles }) => (
                    <Link
                      to={`/society/${society.id}`}
                      key={society.id}
                      className="flex items-center gap-4"
                    >
                      <img
                        src={
                          society.logo ||
                          "/assets/images/society-placeholder.png"
                        }
                        alt={society.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <p className="b2-medium">{society.name}</p>
                      <RolesBadges roles={roles || []} />
                    </Link>
                  ))}
                </ul>
              ) : (
                <p className="b2-regular text-neutral-700">No society Joined</p>
              )}
            </div>
          </div>
        ) : (
          "society" in user && (
            <div className="space-y-4">
              <h5 className="h6-semibold">Society</h5>
              <div className="px-2">
                <Link
                  to={`/society/${user.society?.id}`}
                  className="flex items-center gap-4"
                >
                  <img
                    src={
                      user.society?.logo ||
                      "/assets/images/society-placeholder.png"
                    }
                    alt={user.society?.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <p className="b2-medium">{user.society?.name}</p>
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
