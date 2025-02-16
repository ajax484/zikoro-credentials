import { cn } from "@/lib/utils";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  CredentialsWorkspaceInvite,
  OrganizationTeamMembersCredentials,
} from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";

export const teamMembersColumns = (
  getTeamMembers: () => Promise<void>,
  deleteData: (id: string) => Promise<void>,
  isDeleting: boolean
): ColumnDef<OrganizationTeamMembersCredentials>[] => [
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
      const { organization } = useOrganizationStore();
      const member = row.original as OrganizationTeamMembersCredentials;

      const deleteFn = async () => {
        await deleteData(String(member.id));
        await getTeamMembers();
      };

      return (
        <div className="flex flex-row gap-2">
          <button
            type="button"
            onClick={deleteFn}
            disabled={isDeleting}
            aria-label="Delete"
            className={
              "bg-red-600 hover:bg-red-700 rounded-full border p-2 text-white"
            }
          >
            Delete
          </button>
        </div>
      );
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
