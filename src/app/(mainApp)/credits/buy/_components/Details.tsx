"use client";
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { TOrganization } from "@/types/organization";
import { Button } from "@/components/ui/button";
import useOrganizationStore from "@/store/globalOrganizationStore";

const Details = ({
  workspace,
  handleWorkspaceChange,
  handleNext,
  workspaces,
}: {
  workspace: TOrganization | null;
  handleWorkspaceChange: (organization: TOrganization | null) => void;
  handleNext: () => void;
  workspaces: TOrganization[];
}) => {
  console.log();
  console.log(workspace?.id);

  return (
    <section className="space-y-6 w-full">
      <div className="flex flex-col gap-2 w-full">
        <label className="font-medium text-gray-700">Workspace</label>
        <Select
          value={String(workspace?.id)}
          onValueChange={(id) =>
            handleWorkspaceChange(
              workspaces.find((workspace) => String(workspace.id) === id) ||
                null
            )
          }
        >
          <SelectTrigger className="w-full rounded-lg bg-white text-xs font-medium">
            <SelectValue placeholder={"Select Workspace"} />
          </SelectTrigger>
          <SelectContent>
            {workspaces?.map(({ organizationName, id }) => (
              <SelectItem value={String(id)} key={id}>
                {organizationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        disabled={!workspace}
        onClick={handleNext}
        className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-8 w-fit mx-auto"
      >
        Proceed to checkout
      </Button>
    </section>
  );
};

export default Details;
