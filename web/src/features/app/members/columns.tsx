import { ColumnDef } from "@tanstack/react-table";

import { cn, formatDate } from "@/lib/utils";
import { Avatars } from "@/components/avatars";
import { Checkbox } from "@/components/ui/checkbox";
import { AvatarGroup } from "@/components/avatar-group";
import {
  JoinRequest,
  JoinRequestStatus,
  Member,
  Role,
  Student,
  UserType,
} from "@/types";

import { MemberMenu } from "./components/member-menu";
import { RequestForm } from "./components/request-form";
import { RolesBadges } from "./components/roles-badges";
import { RoleActions } from "./components/role-actions";
import { Badge } from "@/components/ui/badge";
import { DeleteRequest } from "./components/delete-request";

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

export const requestsHistoryColumns: ColumnDef<JoinRequest>[] = [
  {
    accessorKey: "student",
    header: "Student",
    cell: ({ row }) => {
      const student: Student = row.getValue("student");
      return <AvatarGroup user={student} userType={UserType.STUDENT} />;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: JoinRequestStatus = row.getValue("status");

      return (
        <Badge
          className={cn(
            "b3-medium",
            status === JoinRequestStatus.APPROVED
              ? "bg-emerald-50 border-emerald-400 text-emerald-600"
              : "bg-red-100 border-red-400 text-red-600"
          )}
        >
          {status}
        </Badge>
      );
    },
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
    accessorKey: "updatedAt",
    header: "Decision Date",
    cell: ({ row }) => {
      const decisionDate = formatDate(row.getValue("updatedAt"));

      return <p>{decisionDate}</p>;
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      const request = row.original;

      return (
        <div className="text-right space-x-2">
          <RequestForm request={request} />
          <DeleteRequest request={request} />
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

export const rolesColumns: ColumnDef<Role>[] = [
  {
    accessorKey: "id",
    header: "Role Name",
    cell: ({ row }) => {
      const role = row.original;
      return (
        <div className="whitespace-normal">
          <p className="b2-medium">{role.name}</p>
          <p className="b3-regular">{role.description}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "assignedMembers",
    header: "Assigned Members",
    cell: ({ row }) => {
      const members = row.original.assignedMembers;
      return (
        <div>
          {members && members.length === 1 ? (
            <AvatarGroup user={members[0]} userType={UserType.STUDENT} />
          ) : members && members.length > 1 ? (
            <Avatars users={members || []} />
          ) : (
            <div>No assigned members</div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const role = row.original;

      return <RoleActions role={role} />;
    },
  },
];

export const rolesMemberColumns: ColumnDef<Member>[] = [
  {
    id: "select",
    // header: ({ table }) => (
    //   <Checkbox
    //     checked={
    //       table.getIsAllPageRowsSelected() ||
    //       (table.getIsSomePageRowsSelected() && "indeterminate")
    //     }
    //     onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //     aria-label="Select all"
    //   />
    // ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-neutral-400 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Member",
    cell: ({ row }) => {
      const student = row.original;
      return <AvatarGroup user={student} userType={UserType.STUDENT} />;
    },
  },
  {
    accessorKey: "roles",
    header: "Current Roles",
    cell: ({ row }) => <RolesBadges roles={row.getValue("roles")} />,
  },
  {
    accessorKey: "interestedRole.name",
    header: "Interested Role",
    cell: ({ row }) => {
      const member = row.original;
      if (member.interestedRole)
        return <RolesBadges roles={[member.interestedRole]} />;
      else return <p>N/A</p>;
    },
  },
];
