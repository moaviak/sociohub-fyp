import { AvatarGroup } from "@/components/avatar-group";
import { Advisor, Student, UserType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { UserMenu } from "./components/user-menu";

export const usersColumns: ColumnDef<Student | Advisor>[] = [
  {
    accessorKey: "id",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <AvatarGroup
          user={user}
          userType={
            "registrationNumber" in user ? UserType.STUDENT : UserType.ADVISOR
          }
        />
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex justify-end">
          <UserMenu user={user} />
        </div>
      );
    },
  },
];
