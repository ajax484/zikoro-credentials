import { DataTable } from "@/components/DataTable/data-table";
import { useGetPaginatedData, useMutateData } from "@/hooks/services/request";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { OrganizationTeamMembersCredentials } from "@/types/organization";
import { RowSelectionState } from "@tanstack/react-table";
import React, { useState } from "react";
import { teamMembersColumns } from "./TeamMembersColumns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

const TeamMembers = () => {
  const { organization } = useOrganizationStore();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const searchParams = new URLSearchParams({});

  const {
    data: teamMembers,
    isLoading: teamMembersIsLoading,
    total,
    totalPages,
    pagination,
    setPagination,
    getData,
  } = useGetPaginatedData<OrganizationTeamMembersCredentials>(
    `/workspaces/${organization?.organizationAlias}/team`,
    searchParams
  );

  const { mutateData: mutateTeamMember, isLoading: mutateIsLoading } =
    useMutateData<OrganizationTeamMembersCredentials>(
      `/workspaces/${organization?.organizationAlias}/team`
    );

  const updatePage = (page: number) => {
    setPagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setPagination({ page: 1, limit });
  };

  const InviteTeamMember = () => {
    const [email, setEmail] = useState<string>("");
    const [selected, setSelected] = useState<string>("");

    const onSubmit = async () => {
      if (teamMembers.some((member) => member.userEmail === email)) {
        toast.error("This email is already added to the team");
        return;
      }

      await mutateTeamMember({
        payload: {
          userEmail: email,
          workspaceAlias: organization?.organizationAlias,
          userRole: selected,
          workspaceName: organization?.organizationName,
        },
      });
      setEmail("");
      setSelected("");
      await getData();
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 w-fit text-sm"
          >
            Invite Team Member
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none tracking-tight">
              Email
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              type={"email"}
              className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
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
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={onSubmit}
              disabled={selected === "" && !email}
              className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 w-fit text-sm"
            >
              Add Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-4">
        <InviteTeamMember />
      </div>
      <DataTable<OrganizationTeamMembersCredentials>
        columns={teamMembersColumns}
        data={teamMembers}
        currentPage={pagination.page}
        setCurrentPage={updatePage}
        limit={pagination.limit}
        refetch={() => {}}
        totalDocs={total}
        isFetching={teamMembersIsLoading}
        onClick={() => {}}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
};

export default TeamMembers;
