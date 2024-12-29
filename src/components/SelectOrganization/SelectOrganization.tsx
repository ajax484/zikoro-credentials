import { useGetData } from "@/hooks/services/request";
import useUserStore from "@/store/globalUserStore";
import React from "react";
import GradientBorderSelect from "../CustomSelect/GradientSelectBorder";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { TOrganization } from "@/types/organization";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";

const SelectOrganization = () => {
  const { user } = useUserStore();
  const { organization, setOrganization } = useOrganizationStore();

  const {
    data: workspaces,
    isLoading: workspacesIsLoading,
    error: workspacesError,
  } = useGetData<TOrganization[]>(
    `/workspaces?userEmail=${user?.userEmail}`,
    true,
    []
  );

  console.log(workspaces);

  const updateOrganization = (value: string) => {
    setOrganization(
      workspaces?.find((workspace) => String(workspace.id) === value)
    );
  };

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
        <Button className="bg-basePrimary gap-x-2 py-1 text-gray-50 font-medium flex items-center justify-center rounded-lg w-fit text-xs">
          <span>New Workspace</span>
          <PlusCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SelectOrganization;
