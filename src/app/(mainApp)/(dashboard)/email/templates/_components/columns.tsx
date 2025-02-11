import { Checkbox } from "@/components/ui/checkbox";
import { useDeleteRequest, useMutateData } from "@/hooks/services/request";
import { RecipientEmailTemplate } from "@/types/certificates";
import { TUser } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { create } from "domain";
import Link from "next/link";

export const columns = (
  refetch: () => Promise<void>,
  createTemplateFn: ({ name }: { name: string }) => Promise<void>,
  templateIsCreating: boolean
): ColumnDef<RecipientEmailTemplate & { user: TUser }>[] => [
  {
    accessorKey: "select",
    header: ({ table }) => (
      <div className="pl-2">
        <Checkbox
          className="data-[state=checked]:bg-basePrimary"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="pl-2">
        <Checkbox
          className="data-[state=checked]:bg-basePrimary"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          disabled={!row.getCanSelect()}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Template",
    accessorKey: "templateName",
  },
  {
    id: "Created By",
    header: "Created By",
    cell: ({ row }) => {
      const user = row.original.user as TUser;
      return <span>{user.userEmail}</span>;
    },
  },
  {
    header: "Date Created",
    accessorKey: "created_at",
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      return format(date, "MMMM do, yyyy");
    },
    sortingFn: "datetime",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const template = row.original as RecipientEmailTemplate;

      const { deleteData: deleteTemplate, isLoading: templateIsDeleting } =
        useDeleteRequest(
          `/certificates/recipients/templates/${template.templateAlias}`
        );

      const deleteTemplateFn = async () => {
        await deleteTemplate();
        await refetch();
      };

      return (
        <div className="flex gap-2 items-center">
          <button
            onClick={() =>
              createTemplateFn({ name: template.templateName + " copy" })
            }
            disabled={templateIsCreating}
            aria-label="Duplicate template"
            className={"bg-[#f7f8f9] rounded-full border p-2"}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              viewBox="0 0 24 24"
              height="1.5em"
              width="1.5em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11 10L9 10 9 13 6 13 6 15 9 15 9 18 11 18 11 15 14 15 14 13 11 13z" />
              <path d="M4,22h12c1.103,0,2-0.897,2-2V8c0-1.103-0.897-2-2-2H4C2.897,6,2,6.897,2,8v12C2,21.103,2.897,22,4,22z M4,8h12l0.002,12H4 V8z" />
              <path d="M20,2H8v2h12v12h2V4C22,2.897,21.103,2,20,2z" />
            </svg>
          </button>
          <Link
            href={`/email/templates/${template.templateAlias}`}
            className={"bg-[#f7f8f9] rounded-full border p-2"}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              viewBox="0 0 24 24"
              height="1.5em"
              width="1.5em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zM16.045 4.401l1.587 1.585-1.59 1.584-1.586-1.585L16.045 4.401zM6 16v-1.585l7.04-7.018 1.586 1.586L7.587 16H6zM4 20H20V22H4z" />
            </svg>
          </Link>
          <button
            onClick={deleteTemplateFn}
            disabled={templateIsDeleting}
            aria-label="Duplicate template"
            className={"bg-[#f7f8f9] rounded-full border p-2"}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              viewBox="0 0 24 24"
              height="1.5em"
              width="1.5em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="none"
                d="M17.004 20L17.003 8h-1-8-1v12H17.004zM13.003 10h2v8h-2V10zM9.003 10h2v8h-2V10zM9.003 4H15.003V6H9.003z"
              />
              <path d="M5.003,20c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2V8h2V6h-3h-1V4c0-1.103-0.897-2-2-2h-6c-1.103,0-2,0.897-2,2v2h-1h-3 v2h2V20z M9.003,4h6v2h-6V4z M8.003,8h8h1l0.001,12H7.003V8H8.003z" />
              <path d="M9.003 10H11.003V18H9.003zM13.003 10H15.003V18H13.003z" />
            </svg>
          </button>
        </div>
      );
    },
  },
];
