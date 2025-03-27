"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { TOrganization } from "@/types/organization";
import GradientBorderSelect from "../CustomSelect/GradientSelectBorder";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { CreateOrganization } from "../CreateOrganisation/createOrganisation";
import { useFetchWorkspaces } from "@/queries/Workspaces.queries";
import useUserStore from "@/store/globalUserStore";
import { NextStepProvider, NextStep, Tour, useNextStep } from "nextstepjs";
import { dashboardTourSteps } from "../tours/dashboardTour";
import CustomCard from "../tours/CustomCard";
import FirstImage from "@/public/images/dashboard_tour_first.svg";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";
import { useUpdateUser } from "@/mutations/user.mutations";

const steps: Tour[] = [dashboardTourSteps];

const TourTriggerDialog = () => {
  const { user } = useUserStore();

  const {
    startNextStep,
    closeNextStep,
    currentTour,
    currentStep,
    setCurrentStep,
    isNextStepVisible,
  } = useNextStep();

  const [welcomeTour, setWelcomeTour] = useState(false);

  console.log(user?.completedCredentialWorkthrough?.dashboardTour, welcomeTour);

  useEffect(() => {
    if (!user) return;
    if (!user?.completedCredentialWorkthrough?.dashboardTour) {
      setWelcomeTour(true);
    }
  }, [user]);

  const nextStep = () => {
    setWelcomeTour(false);
    startNextStep("dashboardTour");
  };

  return (
    <AlertDialog open={welcomeTour}>
      <AlertDialogContent className="!p-0 !rounded-md !w-[800px] !max-w-[800px] !gap-0">
        <Image src={FirstImage} alt="First Step" height={400} width={800} />

        <div className="p-6 flex flex-col justify-center items-center gap-4">
          <p className="text-xl font-semibold text-gray-800 text-center">
            Hello {user?.firstName}, <br /> Welcome to Zikoro Credentials.
          </p>

          <p className="text-gray-600 text-center">
            Start exploring Zikoro Credentials to see how you can streamline and
            boost your credentialing process effortlessly. 🚀
          </p>

          <Button
            className="flex font-semibold gap-1 items-center justify-center"
            size="sm"
            onClick={nextStep}
          >
            <span>Continue</span>
            <ArrowRight className="size-6" />
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { organization, setOrganization } = useOrganizationStore();
  const { user } = useUserStore();

  const {
    data: workspaces,
    isFetching: workspacesIsLoading,
    refetch: refetchWorkspaces,
    error: workspacesError,
  } = useFetchWorkspaces(user?.userEmail!);

  const [workspace, setWorkspace] = useState<TOrganization | null>(
    organization
  );

  const [open, setOpen] = useState(true);

  const [dialogIsOpen, setDialogIsOpen] = React.useState<boolean>(false);

  const updateOrganization = (value: string) => {
    setWorkspace(
      workspaces?.find((workspace) => String(workspace.id) === value)!
    );
  };

  useEffect(() => {
    setWorkspace(organization);
  }, [organization]);

  useEffect(() => {
    if (!organization) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [organization]);

  return (
    <NextStepProvider>
      <NextStep
        steps={steps}
        cardComponent={CustomCard}
        onComplete={(tourName) => {
          console.log(tourName);
        }}
      >
        <main className="min-h-screen relative bg-[#f7f8ff] flex w-full">
          {/* tour dialog */}
          <TourTriggerDialog />

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader className="px-3">
                <h1 className="text-2xl capitalize font-semibold text-gray-800">
                  Select Workspace
                </h1>
              </AlertDialogHeader>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Workspace:</span>
                <div className="flex items-center gap-4">
                  <GradientBorderSelect
                    placeholder={
                      workspacesIsLoading ? "Loading..." : "Select Organization"
                    }
                    value={String(workspace?.id || "")}
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
              <AlertDialogFooter>
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
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {dialogIsOpen && (
            <CreateOrganization
              refetch={refetchWorkspaces}
              close={() => {
                setOpen(true);
                setDialogIsOpen(false);
              }}
              allowRedirect={true}
              isInitial
            />
          )}

          <aside className="hidden md:block min-h-full border-r group bg-white fixed z-[50]">
            <Sidebar />
          </aside>
          <section className="py-16 pl-4 pr-16 flex-1 ml-[175px] max-w-[1400px] 2xl:!mx-auto">
            {children}
          </section>
        </main>
      </NextStep>
    </NextStepProvider>
  );
};

export default DashboardLayout;
