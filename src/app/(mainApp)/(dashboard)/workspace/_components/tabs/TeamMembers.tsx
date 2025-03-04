import { DataTable } from "@/components/DataTable/data-table";
import {
  useDeleteRequest,
  useGetPaginatedData,
  useMutateData,
} from "@/hooks/services/request";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  CredentialsWorkspaceInvite,
  OrganizationTeamMembersCredentials,
} from "@/types/organization";
import { RowSelectionState } from "@tanstack/react-table";
import React, { useState } from "react";
import {
  inviteTeamMemberColumns,
  teamMembersColumns,
} from "./TeamMembersColumns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import useUserStore from "@/store/globalUserStore";
import { DialogTitle } from "@radix-ui/react-dialog";

const TeamMembers = () => {
  const { organization } = useOrganizationStore();
  const { user: userData } = useUserStore();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const searchParams = new URLSearchParams({});

  const {
    data: teamMembers,
    isLoading: teamMembersIsLoading,
    total: teamMembersTotal,
    totalPages: teamMembersTotalPages,
    pagination: teamMembersPagination,
    setPagination: setTeamMembersPagination,
    getData: getTeamMembers,
  } = useGetPaginatedData<OrganizationTeamMembersCredentials>(
    `/workspaces/${organization?.organizationAlias}/team`,
    searchParams
  );

  const {
    data: teamMembersInvites,
    isLoading: teamMembersInviteIsLoading,
    total: teamMembersInviteTotal,
    totalPages: teamMembersInviteTotalPages,
    pagination: teamMembersInvitePagination,
    setPagination: setTeamMembersInvitePagination,
    getData: getTeamMembersInvite,
  } = useGetPaginatedData<CredentialsWorkspaceInvite>(
    `/workspaces/${organization?.organizationAlias}/team/invites`,
    searchParams
  );

  console.log(teamMembersInvites);

  const { mutateData: inviteTeamMember, isLoading: invitingTeamMember } =
    useMutateData<OrganizationTeamMembersCredentials>(
      `/workspaces/${organization?.organizationAlias}/team/invites`
    );

  const { deleteData: deleteTeamMember, isLoading: teamMemberDeleting } =
    useDeleteRequest(`/workspaces/${organization?.organizationAlias}/team`);

  const updatePage = (page: number) => {
    setTeamMembersPagination({ page, limit: 10 });
  };

  const updateInvitePage = (page: number) => {
    setTeamMembersInvitePagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setTeamMembersPagination({ page: 1, limit });
  };

  const updateInviteLimit = (limit: number) => {
    setTeamMembersInvitePagination({ page: 1, limit });
  };

  const InviteTeamMember = () => {
    const [email, setEmail] = useState<string>("");
    const [selected, setSelected] = useState<string>("");

    const onSubmit = async () => {
      if (teamMembers.some((member) => member.userEmail === email)) {
        toast.error("This email is already added to the team");
        return;
      }

      await inviteTeamMember({
        payload: {
          userEmail: email,
          workspaceAlias: organization?.organizationAlias,
          userRole: selected,
          workspaceName: organization?.organizationName,
        },
      });
      setEmail("");
      setSelected("");
      await getTeamMembers();
      await getTeamMembersInvite();
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
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Invite Team Member
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none tracking-tight">
              Email
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              type={"email"}
              required
              className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-white text-gray-700 bg-basePrimary/20 border"
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
              disabled={selected === "" || !email || !selected}
              className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 w-fit text-sm"
            >
              Add Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const verificationStatus =
    organization?.verification &&
    organization?.verification?.length > 0 &&
    organization?.verification.every((v) => v.status !== "rejected")
      ? organization?.verification.some((v) => v.status === "verified")
        ? "verified"
        : "pending"
      : "unverified";

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">Team Members</h1>
          <div className="flex justify-end gap-4">
            {teamMembers.find(
              ({ userEmail }) => userEmail === userData?.userEmail
            )?.userRole === "owner" &&
              verificationStatus === "verified" && <InviteTeamMember />}
            {verificationStatus !== "verified" && (
              <span className="font-bold text-xs text-red-600">
                Complete verification to invite team members
              </span>
            )}
          </div>
        </div>
        <DataTable<OrganizationTeamMembersCredentials>
          columns={teamMembersColumns(
            getTeamMembers,
            deleteTeamMember,
            teamMemberDeleting
          )}
          data={teamMembers}
          currentPage={teamMembersPagination.page}
          setCurrentPage={updatePage}
          limit={teamMembersPagination.limit}
          refetch={() => {}}
          totalDocs={teamMembersTotal}
          isFetching={teamMembersIsLoading}
          onClick={() => {}}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
      {teamMembersInvites.length > 0 && !teamMembersInviteIsLoading && (
        <div className="space-y-4">
          <h1 className="text-lg font-medium">Invites</h1>
          <DataTable
            columns={inviteTeamMemberColumns}
            data={teamMembersInvites}
            currentPage={teamMembersInvitePagination.page}
            setCurrentPage={updateInvitePage}
            limit={teamMembersInvitePagination.limit}
            refetch={() => {}}
            totalDocs={teamMembersInviteTotalPages}
            isFetching={teamMembersInviteIsLoading}
            onClick={() => {}}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      )}
    </section>
  );
};

export default TeamMembers;
