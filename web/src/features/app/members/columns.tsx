import { ColumnDef } from "@tanstack/react-table";

import { AvatarGroup } from "@/components/avatar-group";
import { JoinRequest, Student, UserType } from "@/types";
import { RequestForm } from "./components/request-form";
import { formatDate } from "@/lib/utils";

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
