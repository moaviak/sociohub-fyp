import { ColumnDef } from "@tanstack/react-table";

import { formatDate } from "@/lib/utils";
import { AvatarGroup } from "@/components/avatar-group";
import { JoinRequest, Member, Student, UserType } from "@/types";

import { MemberMenu } from "./components/member-menu";
import { RequestForm } from "./components/request-form";
import { RolesBadges } from "./components/roles-badges";

export const requestsColumns: ColumnDef<JoinRequest>[] = [
  {
    accessorKey: "student",
    header: "Student",
    cell: ({ row }) => {
      const student: Student = row.getValue("student");
      return <AvatarGroup user={student} userType={UserType.STUDENT} />;
    },
  },
  {
    accessorKey: "student.email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Request Date",
    cell: ({ row }) => {
      const requestDate = formatDate(row.getValue("createdAt"));

      return <p>{requestDate}</p>;
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      const request = row.original;

      return (
        <div className="text-right">
          <RequestForm request={request} />
        </div>
      );
    },
  },
];

export const membersColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "id",
    header: "Student",
    cell: ({ row }) => {
      const student = row.original;
      return <AvatarGroup user={student} userType={UserType.STUDENT} />;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => <RolesBadges roles={row.getValue("roles")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;

      return <MemberMenu member={member} />;
    },
  },
];
