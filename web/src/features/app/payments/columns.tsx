import { AvatarGroup } from "@/components/avatar-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Transaction, UserType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = format(row.original.createdAt, "dd MMM yyyy hh:mm a");
      return <div className="b3-regular">{date}</div>;
    },
  },
  {
    accessorKey: "event",
    header: "Event",
    cell: ({ row }) => {
      return <div className="b3-regular">{row.original.event.title}</div>;
    },
  },
  {
    accessorKey: "student",
    header: "Student",
    cell: ({ row }) => {
      return (
        <AvatarGroup user={row.original.student} userType={UserType.STUDENT} />
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return <div className="b3-semibold">RS {row.original.amount}</div>;
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
            status === "COMPLETED" && "bg-emerald-100 text-emerald-600",
            status === "PENDING" && "bg-yellow-100 text-yellow-600",
            status === "FAILED" && "bg-red-100 text-red-600",
            status === "CANCELLED" && "bg-gray-100 text-gray-600"
          )}
        >
          {status}
        </Badge>
      );
    },
  },
];
