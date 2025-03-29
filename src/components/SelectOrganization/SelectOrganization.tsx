"use client";
import { useGetData } from "@/hooks/services/request";
import useUserStore from "@/store/globalUserStore";
import React, { useEffect } from "react";
import GradientBorderSelect from "../CustomSelect/GradientSelectBorder";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { TOrganization } from "@/types/organization";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { CreateOrganization } from "../CreateOrganisation/createOrganisation";
import { useSearchParams } from "next/navigation";
import { useFetchWorkspaces } from "@/queries/Workspaces.queries";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import GradientText from "../GradientText";

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

  const [position, setPosition] = React.useState("bottom");

  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-1" id="step1">
      <span className="text-xs text-gray-600">Workspace:</span>
      <div className="flex items-center gap-4" id="step2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-fit rounded-lg bg-white text-xs font-medium justify-between border-basePrimary hover:bg-basePrimary/10"
            >
              <GradientText Tag={"span"}>
                {organization
                  ? workspaces.find(
                      (option) =>
                        option.organizationAlias ===
                        organization.organizationAlias
                    )?.organizationName
                  : `Select Workspace...`}
              </GradientText>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-basePrimary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandInput
                placeholder={`enter Workspace...`}
                className="text-sm"
              />
              <CommandList>
                <CommandEmpty>No workspace found.</CommandEmpty>
                <CommandGroup heading={"Worskpaces"}>
                  {workspaces?.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={String(option.id)}
                      onSelect={(currentValue: string) => {
                        updateOrganization(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          organization && organization.id === option.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.organizationName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="w-full px-1 pb-1 pt-4">
              <Button
                onClick={() => {
                  setOpen(false);
                  setDialogIsOpen(true);
                }}
                size="sm"
                className="gap-x-2 font-semibold flex items-center justify-center rounded-lg w-full"
              >
                <PlusCircle className="size-6" />
                <span>New Workspace</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* <GradientBorderSelect
          placeholder={
            workspacesIsLoading ? "Loading..." : "Select Organization"
          }
          value={String(organization?.id || "")}
          onChange={(value) => updateOrganization(value)}
          options={workspaces?.map(({ organizationName, id }) => ({
            label: organizationName,
            value: String(id),
          }))}
        /> */}
        {/* <Button
          onClick={() => setDialogIsOpen(true)}
          size="sm"
          className="gap-x-2 font-medium flex items-center justify-center rounded-lg w-fit text-xs"
        >
          <span>New Workspace</span>
          <PlusCircle className="w-4 h-4" />
        </Button> */}
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
