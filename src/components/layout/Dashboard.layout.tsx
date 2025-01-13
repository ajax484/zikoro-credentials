"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import SelectOrganization from "../SelectOrganization/SelectOrganization";
import { TOrganization } from "@/types/organization";
import { useGetData } from "@/hooks/services/request";
import GradientBorderSelect from "../CustomSelect/GradientSelectBorder";
import useUserStore from "@/store/globalUserStore";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { CreateOrganization } from "../CreateOrganisation/createOrganisation";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();

  const { organization, setOrganization } = useOrganizationStore();

  const {
    data: workspaces,
    isLoading: workspacesIsLoading,
    error: workspacesError,
  } = useGetData<TOrganization[]>(
    `/workspaces?userEmail=${user?.userEmail || "ubahyusuf484@gmail.com"}`,
    []
  );

  const [workspace, setWorkspace] = useState<TOrganization | null>(
    organization
  );

  const [dialogIsOpen, setDialogIsOpen] = React.useState<boolean>(true);

  useEffect(() => {
    if (workspaces.length > 0) {
      setDialogIsOpen(false);
    } else {
      setDialogIsOpen(true);
    }
  }, [workspacesIsLoading]);

  if (workspacesIsLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 bg-basePrimary flex items-center justify-center p-4">
          <div className="w-full h-full bg-white rounded-full" />
        </div>
      </div>
    );

  return (
    <main className="min-h-screen relative bg-[#f7f8ff] flex w-full">
      {/* if organization is not set, show dialog */}
      {/* {false && (
        <>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader className="px-3">
                <h1 className="text-2xl capitalize font-semibold text-gray-800">
                  Select Workspaces
                </h1>
              </DialogHeader>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Workspace:</span>
                <div className="flex items-center gap-4">
                  <GradientBorderSelect
                    placeholder={
                      workspacesIsLoading ? "Loading..." : "Select Organization"
                    }
                    value={String(workspace?.id)}
                    onChange={(value) => updateOrganization(value)}
                    options={workspaces?.map(({ organizationName, id }) => ({
                      label: organizationName,
                      value: String(id),
                    }))}
                  />
                  <Button
                    onClick={() => {
                      setOpen(false);
                      setDialogIsOpen(true);
                    }}
                    className="bg-basePrimary gap-x-2 py-1 text-gray-50 font-medium flex items-center justify-center rounded-lg w-fit text-xs"
                  >
                    <span>New Workspace</span>
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setOpen(false);
                    setOrganization(workspace);
                  }}
                  className="bg-basePrimary text-white"
                  type="button"
                >
                  Select
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )} */}
      {dialogIsOpen && (
        <CreateOrganization
          close={() => {
          setDialogIsOpen(false);
          }}
          allowRedirect={true}
          isInitial
        />
      )}
      <aside className="hidden md:block min-h-full border-r group bg-white fixed z-[50]">
        <Sidebar />
      </aside>
      <section className="py-16 px-12 flex-1 ml-[100px] max-w-[1400px] 2xl:!mx-auto">
        {children}
      </section>
    </main>
  );
};

export default DashboardLayout;
