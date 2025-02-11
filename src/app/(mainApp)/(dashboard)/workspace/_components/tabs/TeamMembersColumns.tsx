import { OrganizationTeamMembersCredentials } from "@/types/organization";
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
    }
  ];
