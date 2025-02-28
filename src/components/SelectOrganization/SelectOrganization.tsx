"use client";
import { useGetData } from "@/hooks/services/request";
import useUserStore from "@/store/globalUserStore";
import React, { useEffect } from "react";
import GradientBorderSelect from "../CustomSelect/GradientSelectBorder";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { TOrganization } from "@/types/organization";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";
import { CreateOrganization } from "../CreateOrganisation/createOrganisation";
import { useSearchParams } from "next/navigation";
import { useFetchWorkspaces } from "@/queries/Workspaces.queries";

const SelectOrganization = () => {
  const searchParams = useSearchParams();
  const workspaceAlias = searchParams.get("workspaceAlias");
  const { user } = useUserStore();
  const { organization, setOrganization } = useOrganizationStore();

  const {
    data: workspaces,
    isFetching: workspacesIsLoading,
    refetch: refetchWorkspaces,
    error: workspacesError,
  } = useFetchWorkspaces(user?.userEmail!);

  console.log(workspaces);

  useEffect(() => {
    if (workspaceAlias) {
      const workspace = workspaces?.find(
        (workspace) => workspace.organizationAlias === workspaceAlias
      );
      if (!workspace) return;
      setOrganization(workspace);
    }
  }, [workspaceAlias]);

  useEffect(() => {
    const workspace = workspaces?.find(
      (workspace) =>
        workspace.organizationAlias === organization?.organizationAlias
    );
    console.log(workspace);
    if (!workspace) return;
    setOrganization(workspace);
  }, [workspaces]);

  const updateOrganization = (value: string) => {
    setOrganization(
      workspaces?.find((workspace) => String(workspace.id) === value)!
    );
  };

  const [dialogIsOpen, setDialogIsOpen] = React.useState<boolean>(false);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-600">Workspace:</span>
      <div className="flex items-center gap-4">
        <GradientBorderSelect
          placeholder={
            workspacesIsLoading ? "Loading..." : "Select Organization"
          }
          value={String(organization?.id)}
          onChange={(value) => updateOrganization(value)}
          options={workspaces?.map(({ organizationName, id }) => ({
            label: organizationName,
            value: String(id),
          }))}
        />
        <Button
          onClick={() => setDialogIsOpen(true)}
          size="sm"
          className="gap-x-2 font-medium flex items-center justify-center rounded-lg w-fit text-xs"
        >
          <span>New Workspace</span>
          <PlusCircle className="w-4 h-4" />
        </Button>
        {dialogIsOpen && (
          <CreateOrganization
            close={() => setDialogIsOpen(false)}
            allowRedirect={true}
            refetch={refetchWorkspaces}
          />
        )}
      </div>
    </div>
  );
};

export default SelectOrganization;
