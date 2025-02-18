import GradientText from "@/components/GradientText";
import { cn } from "@/lib/utils";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  CredentialsWorkspaceInvite,
  OrganizationTeamMembersCredentials,
} from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { useUpdateData } from "@/hooks/services/request";

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
        <GradientText
          className="text-sm cursor-pointer rounded-xl px-4 py-2 font-medium border-basePrimary border-[1.5px]"
          Tag={"span"}
        >
          {role}
        </GradientText>
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

      const DeleteMember = () => {
        const clsBtnRef = useRef<HTMLButtonElement>(null);

        return (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                disabled={isDeleting}
                aria-label="Delete"
                className={
                  "bg-red-600 hover:bg-red-700 rounded-xl border px-4 py-2 text-white"
                }
              >
                Delete
              </button>
            </DialogTrigger>
            <DialogContent className="px-4 py-6 z-[1000]">
              <DialogHeader className="px-3">
                <DialogTitle>Remove Member</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-col gap-4 items-center py-4">
                  <svg
                    width={57}
                    height={50}
                    viewBox="0 0 57 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M55.6998 41.0225L33.8373 3.05501C33.2909 2.12482 32.511 1.35356 31.5748 0.817663C30.6385 0.281767 29.5785 -0.000152588 28.4998 -0.000152588C27.421 -0.000152588 26.361 0.281767 25.4247 0.817663C24.4885 1.35356 23.7086 2.12482 23.1623 3.05501L1.29975 41.0225C0.774092 41.9222 0.49707 42.9455 0.49707 43.9875C0.49707 45.0295 0.774092 46.0528 1.29975 46.9525C1.83908 47.8883 2.61768 48.6638 3.55566 49.1993C4.49363 49.7349 5.55721 50.0112 6.63725 50H50.3623C51.4414 50.0103 52.504 49.7336 53.441 49.1981C54.378 48.6626 55.1558 47.8876 55.6948 46.9525C56.2212 46.0532 56.4991 45.0302 56.4999 43.9882C56.5008 42.9462 56.2247 41.9227 55.6998 41.0225ZM52.2323 44.95C52.0417 45.2751 51.768 45.5437 51.4394 45.7282C51.1108 45.9127 50.7391 46.0065 50.3623 46H6.63725C6.26044 46.0065 5.88868 45.9127 5.56008 45.7282C5.23147 45.5437 4.95784 45.2751 4.76725 44.95C4.59461 44.6577 4.50355 44.3245 4.50355 43.985C4.50355 43.6455 4.59461 43.3123 4.76725 43.02L26.6298 5.05251C26.8242 4.72894 27.0991 4.4612 27.4276 4.27532C27.7562 4.08944 28.1273 3.99175 28.5048 3.99175C28.8822 3.99175 29.2533 4.08944 29.5819 4.27532C29.9104 4.4612 30.1853 4.72894 30.3798 5.05251L52.2423 43.02C52.4134 43.3132 52.5027 43.6469 52.501 43.9864C52.4992 44.3258 52.4064 44.6586 52.2323 44.95ZM26.4998 30V20C26.4998 19.4696 26.7105 18.9609 27.0855 18.5858C27.4606 18.2107 27.9693 18 28.4998 18C29.0302 18 29.5389 18.2107 29.914 18.5858C30.289 18.9609 30.4998 19.4696 30.4998 20V30C30.4998 30.5304 30.289 31.0392 29.914 31.4142C29.5389 31.7893 29.0302 32 28.4998 32C27.9693 32 27.4606 31.7893 27.0855 31.4142C26.7105 31.0392 26.4998 30.5304 26.4998 30ZM31.4998 39C31.4998 39.5934 31.3238 40.1734 30.9942 40.6667C30.6645 41.1601 30.196 41.5446 29.6478 41.7716C29.0996 41.9987 28.4964 42.0581 27.9145 41.9424C27.3325 41.8266 26.798 41.5409 26.3784 41.1213C25.9589 40.7018 25.6732 40.1672 25.5574 39.5853C25.4416 39.0033 25.5011 38.4001 25.7281 37.852C25.9552 37.3038 26.3397 36.8352 26.833 36.5056C27.3264 36.176 27.9064 36 28.4998 36C29.2954 36 30.0585 36.3161 30.6211 36.8787C31.1837 37.4413 31.4998 38.2044 31.4998 39Z"
                      fill="#001FCC"
                    />
                  </svg>
                  <div className="text-gray-800 font-medium flex flex-col gap-2 text-center">
                    <span>
                      Are you sure you want to remove this member:{" "}
                      <b>{member.userEmail}?</b>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={isDeleting}
                    onClick={(e) => {
                      e.stopPropagation();
                      clsBtnRef.current?.click();
                    }}
                    className="border-2 bg-white border-basePrimary text-basePrimary w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isDeleting}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteFn();
                      clsBtnRef.current?.click();
                    }}
                    className="bg-basePrimary w-full"
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <DialogClose asChild>
                <button className="hidden" ref={clsBtnRef}>
                  close
                </button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        );
      };

      const { updateData: updateTeamMember, isLoading: updatingTeamMember } =
        useUpdateData<OrganizationTeamMembersCredentials>(
          `/workspaces/${organization?.organizationAlias}/team`
        );

      const UpdateTeamMember = () => {
        const [selected, setSelected] = useState<string>(member.userRole || "");

        const onSubmit = async () => {
          await updateTeamMember({
            payload: {
              ...member,
              userRole: selected,
            },
          });
          setSelected("");
          await getTeamMembers();
        };

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 w-fit text-sm"
                disabled={updatingTeamMember}
              >
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full flex flex-col gap-6">
              <DialogHeader>
                <DialogTitle>Update Team Member</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-none tracking-tight">
                  Email
                </label>
                <Input
                  value={member.userEmail || ""}
                  placeholder="Enter email"
                  type={"email"}
                  disabled
                  required
                  className="placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium leading-none tracking-tight text-center">
                  Assign permissions
                </div>
                <div className="flex gap-4 justify-center items-center">
                  <label
                    className={cn(
                      "text-sm cursor-pointer border rounded-xl px-4 py-2 font-medium",
                      selected === "assign"
                        ? "border-basePrimary text-basePrimary"
                        : "text-gray-500 border-gray-500"
                    )}
                  >
                    <input
                      type="radio"
                      name="assign"
                      value="assign"
                      checked={selected === "assign"}
                      onChange={(e) => setSelected("assign")}
                      className="hidden"
                    />
                    Assign
                  </label>
                  <label
                    className={cn(
                      "text-sm cursor-pointer border rounded-xl px-4 py-2 font-medium",
                      selected === "create"
                        ? "border-basePrimary text-basePrimary"
                        : "text-gray-500 border-gray-500"
                    )}
                  >
                    <input
                      type="radio"
                      name="assign"
                      value="assign"
                      checked={selected === "create"}
                      onChange={(e) => setSelected("create")}
                      className="hidden"
                    />
                    Create
                  </label>
                  <label
                    className={cn(
                      "text-sm cursor-pointer border rounded-xl px-4 py-2 font-medium",
                      selected === "assign/create"
                        ? "border-basePrimary text-basePrimary"
                        : "text-gray-500 border-gray-500"
                    )}
                  >
                    <input
                      type="radio"
                      name="assign"
                      value="assign"
                      checked={selected === "assign/create"}
                      onChange={(e) => setSelected("assign/create")}
                      className="hidden"
                    />
                    Assign/create
                  </label>
                  <label
                    className={cn(
                      "text-sm cursor-pointer border rounded-xl px-4 py-2 font-medium",
                      selected === "owner"
                        ? "border-basePrimary text-basePrimary"
                        : "text-gray-500 border-gray-500"
                    )}
                  >
                    <input
                      type="radio"
                      name="assign"
                      value="assign"
                      checked={selected === "owner"}
                      onChange={(e) => setSelected("owner")}
                      className="hidden"
                    />
                    Owner
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={onSubmit}
                  disabled={selected === "" && !selected && !updatingTeamMember}
                  className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 w-fit text-sm"
                >
                  Update Team Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      };

      return member.userRole !== "owner" ? (
        <div className="flex flex-row gap-2">
          <DeleteMember />
          <UpdateTeamMember />
        </div>
      ) : (
        ""
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
          <GradientText
            className="text-sm cursor-pointer rounded-xl px-4 py-2 font-medium border-basePrimary border-[1.5px]"
            Tag={"span"}
          >
            {role}
          </GradientText>
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
