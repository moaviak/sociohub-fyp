import { Link } from "react-router";

import { Advisor, Student } from "@/types";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { Hint } from "./hint";

interface AvatarsProps {
  users: Student[] | Advisor[];
}

export const Avatars = ({ users }: AvatarsProps) => {
  return (
    <div className="flex -space-x-2">
      {users.map((user) => (
        <Hint key={user.id} description={`${user.firstName} ${user.lastName}`}>
          <Link to={`/profile/${user.id}`}>
            <Avatar className="border border-2 border-white h-10 w-10">
              <AvatarImage
                src={user.avatar ?? "/assets/images/avatar-placeholder.png"}
              />
            </Avatar>
          </Link>
        </Hint>
      ))}
    </div>
  );
};
