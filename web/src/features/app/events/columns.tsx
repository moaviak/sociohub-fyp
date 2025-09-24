import { AvatarGroup } from "@/components/avatar-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Registration, Student, UserType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const registrationsColumns: ColumnDef<Registration>[] = [
  {
    accessorKey: "studentId",
    header: "Student",
    cell: ({ row }) => {
      const student: Student | null = row.getValue("student");
      return student ? (
        <AvatarGroup user={student} userType={UserType.STUDENT} />
      ) : (
        <p className="b3-regular text-muted-foreground">Unknown student</p>
      );
    },
  },
  {
    accessorKey: "registeredAt",
    header: "Registration Time",
    cell: ({ row }) => {
      const date = format(
        row.original.registeredAt || new Date(),
        "dd MMM yyyy hh:mm a"
      );
      return <div className="b3-regular">{date}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={cn(
            "b4-medium",
            status === "APPROVED" && "bg-emerald-100 text-emerald-600",
            status === "PENDING" && "bg-yellow-100 text-yellow-600",
            status === "DECLINED" && "bg-red-100 text-red-600"
          )}
        >
          {status}
        </Badge>
      );
    },
  },
];
