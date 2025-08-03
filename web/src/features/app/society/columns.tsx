import { AvatarGroup } from "@/components/avatar-group";
import { ActivityLog, UserType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export const activityLogsColumns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: "student",
    header: "User",
    cell: ({ row }) => {
      const student = row.original.student;

      return <AvatarGroup user={student} userType={UserType.STUDENT} />;
    },
  },
  {
    accessorKey: "targetId",
    header: "Entity ID",
    cell: ({ row }) => {
      const targetId = row.getValue("targetId") as string;

      return (
        <span className="font-mono text-sm text-neutral-600">{targetId}</span>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      const nature = row.original.nature;

      const actionColors = {
        CONSTRUCTIVE: "text-emerald-600 bg-emerald-50",
        NEUTRAL: "text-neutral-600 bg-neutral-50",
        DESTRUCTIVE: "text-red-600 bg-red-50",
        ADMINISTRATIVE: "text-primary-600 bg-primary-50",
      }[nature];

      return (
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${actionColors}`}
        >
          {action}
        </span>
      );
    },
  },
  {
    accessorKey: "targetType",
    header: "Type",
    cell: ({ row }) => {
      const targetType = row.getValue("targetType") as string;

      return <span className="text-neutral-700">{targetType}</span>;
    },
  },
  {
    id: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => {
      const timestamp = new Date(row.original.timestamp).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
      const time = new Date(row.original.timestamp).toLocaleTimeString(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

      return (
        <div className="text-sm text-neutral-600">
          <div>{timestamp}</div>
          <div className="text-neutral-400">{time}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 300,
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      const nature = row.original.nature;

      const textColor = {
        CONSTRUCTIVE: "text-emerald-700",
        NEUTRAL: "text-neutral-700",
        DESTRUCTIVE: "text-red-700",
        ADMINISTRATIVE: "text-primary-700",
      }[nature];

      return (
        <div className={`w-[300px] ${textColor}`}>
          <span className="truncate block" title={description}>
            {description}
          </span>
        </div>
      );
    },
  },
];

export const miniActivityLogsColumns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: "student",
    header: "User",
    cell: ({ row }) => {
      const student = row.original.student;

      return (
        <div>
          <p className="b3-medium">{`${student.firstName} ${student.lastName}`}</p>
          <p className="b4-regular">{student.registrationNumber}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      const nature = row.original.nature;

      const actionColors = {
        CONSTRUCTIVE: "text-emerald-600 bg-emerald-50",
        NEUTRAL: "text-neutral-600 bg-neutral-50",
        DESTRUCTIVE: "text-red-600 bg-red-50",
        ADMINISTRATIVE: "text-primary-600 bg-primary-50",
      }[nature];

      return (
        <span className={`px-1 py-0.5 rounded-md b4-medium ${actionColors}`}>
          {action}
        </span>
      );
    },
  },
  {
    id: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => {
      const timestamp = new Date(row.original.timestamp).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
      const time = new Date(row.original.timestamp).toLocaleTimeString(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

      return (
        <div className="b3-regular text-neutral-600">
          <div>{timestamp}</div>
          <div className="text-neutral-400">{time}</div>
        </div>
      );
    },
  },
];
