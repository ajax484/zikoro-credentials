import { cn } from "@/lib/utils";
import {
  CredentialsWorkspaceInvite,
  OrganizationTeamMembersCredentials,
} from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";

export const teamMembersColumns: ColumnDef<OrganizationTeamMembersCredentials>[] =
  [
    {
      accessorKey: "userEmail",
      header: "Email",
      cell: ({ getValue }) => {
        const email = getValue() as string;
        return (
          <div className="flex items-center gap-2">
            <span>{email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "userRole",
      header: "Role",
      cell: ({ getValue }) => {
        const role = getValue() as string;
        return (
          <span className="text-sm cursor-pointer border rounded-xl px-4 py-2 font-medium border-basePrimary text-basePrimary">
            {role}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original as OrganizationTeamMembersCredentials;

        return <div className="flex flex-row gap-2"></div>;
      },
    },
  ];

export const inviteTeamMemberColumns: ColumnDef<CredentialsWorkspaceInvite>[] =
  [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => {
        const email = getValue() as string;
        return (
          <div className="flex items-center gap-2">
            <span>{email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ getValue }) => {
        const role = getValue() as string;
        return (
          <span className="text-sm cursor-pointer border rounded-xl px-4 py-2 font-medium border-basePrimary text-basePrimary">
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <span
            className={cn(
              "capitalize",
              status === "accepted"
                ? "text-green-500"
                : status === "rejected"
                ? "text-red-500"
                : "text-amber-500"
            )}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original;

        return <div className="flex flex-row gap-2"></div>;
      },
    },
  ];
