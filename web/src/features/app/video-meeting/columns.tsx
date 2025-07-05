import { AvatarGroup } from "@/components/avatar-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Meeting,
  MeetingInvitation,
  MeetingParticipant,
  MeetingStatus,
  UserType,
} from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { MeetingMenu } from "./components/meeting-menu";

export const meetingsColumns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    id: "hostId",
    accessorFn: (row) => row.hostAdvisorId || row.hostStudentId,
    header: "Hosted By",
    cell: ({ row }) => {
      const meeting = row.original;

      return (
        <div>
          {meeting.hostStudent || meeting.hostAdvisor ? (
            <AvatarGroup
              user={(meeting.hostStudent ?? meeting.hostAdvisor)!}
              userType={
                meeting.hostAdvisor ? UserType.ADVISOR : UserType.STUDENT
              }
            />
          ) : (
            <p>N/A</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "scheduledAt",
    header: "Scheduled At",
    cell: ({ row }) => {
      const meeting = row.original;
      return (
        <div>
          {formatDate(meeting.scheduledAt, "EEE, MMM d, uuuu | hh:mm  a")}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const meeting = row.original;
      return (
        <Badge
          variant={"outline"}
          className={cn(
            "capitalize",
            meeting.status === MeetingStatus.SCHEDULED &&
              "bg-secondary-100 border-secondary-400 text-secondary-600",
            meeting.status === MeetingStatus.LIVE &&
              "bg-red-100 border-red-400 text-red-500",
            meeting.status === MeetingStatus.ENDED &&
              "bg-emerald-100 border-emerald-300 text-emerald-500",
            meeting.status === MeetingStatus.CANCELLED &&
              "bg-accent-100 border-accent-300 text-accent-500"
          )}
        >
          {meeting.status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const meeting = row.original;

      return (
        <div className="float-end">
          <MeetingMenu meeting={meeting} />
        </div>
      );
    },
  },
];

export const meetingInvitationsColumns: ColumnDef<MeetingInvitation>[] = [
  {
    id: "user",
    accessorFn: (row) => row.student || row.advisor,
    header: "Name",
    cell: ({ row }) => {
      const user = row.original.advisor || row.original.student!;

      return (
        <p className="b3-regular">{`${user.firstName} ${user.lastName}`}</p>
      );
    },
  },
  {
    id: "registrationNumber",
    accessorFn: (row) => row.student?.registrationNumber,
    header: "Registration #",
    cell: ({ row }) => {
      const user = row.original.student;

      return (
        <p className="b3-regular">{user ? user.registrationNumber : ""}</p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge
          variant={"outline"}
          className={cn(
            status === "PENDING" &&
              "bg-secondary-100 border-secondary-400 text-secondary-600",
            status === "ACCEPTED" &&
              "bg-emerald-100 border-emerald-400 text-emerald-600",
            status === "DECLINED" && "bg-red-100 border-red-300 text-red-500"
          )}
        >
          {status}
        </Badge>
      );
    },
  },
];

export const meetingParticipantsColumns: ColumnDef<MeetingParticipant>[] = [
  {
    id: "user",
    accessorFn: (row) => row.student || row.advisor,
    header: "Name",
    cell: ({ row }) => {
      const user = row.original.advisor || row.original.student!;

      return (
        <p className="b3-regular">{`${user.firstName} ${user.lastName}`}</p>
      );
    },
  },
  {
    id: "registrationNumber",
    accessorFn: (row) => row.student?.registrationNumber,
    header: "Registration #",
    cell: ({ row }) => {
      const user = row.original.student;

      return (
        <p className="b3-regular">{user ? user.registrationNumber : ""}</p>
      );
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Joined At",
    cell: ({ row }) => {
      const joinedAt = row.original.joinedAt;

      return <p className="b3-regular">{formatDate(joinedAt, "hh:mm  a")}</p>;
    },
  },
  {
    accessorKey: "leftAt",
    header: "Left At",
    cell: ({ row }) => {
      const leftAt = row.original.leftAt;

      return (
        <p className="b3-regular">
          {leftAt ? formatDate(leftAt, "hh:mm  a") : ""}
        </p>
      );
    },
  },
];
