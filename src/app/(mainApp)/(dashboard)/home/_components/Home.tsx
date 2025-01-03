"use client";
import useUserStore from "@/store/globalUserStore";
import React, { useState } from "react";
import Badge from "@/public/icons/iconamoon_certificate-badge-duotone.svg";
import Certificate from "@/public/icons/ph_certificate-duotone.svg";
import Image from "next/image";
import { useGetData } from "@/hooks/services/request";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TCertificate } from "@/types/certificates";
import Email from "@/public/icons/mdi_email-sent.svg";
import Calendar from "@/public/icons/duo-icons_calendar.svg";
import { format } from "date-fns";
import Link from "next/link";
import { useCreateCertificate } from "@/hooks";
import { toast } from "react-toastify";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TOrganization } from "@/types/organization";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { CreateOrganization } from "@/components/CreateOrganisation/createOrganisation";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const CreateCertificateDialog = ({
  open,
  setOpen,
  createCertificateFn,
  certificateIsCreating,
  setDialogIsOpen,
  workspaces,
  workspacesIsLoading,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  createCertificateFn: ({
    name,
    workspace,
  }: {
    name: string;
    workspace: TOrganization;
  }) => void;
  certificateIsCreating: boolean;
  setDialogIsOpen: (open: boolean) => void;
  workspaces: TOrganization[];
  workspacesIsLoading: boolean;
}) => {
  const { organization, setOrganization } = useOrganizationStore();

  const [workspace, setWorkspace] = useState<TOrganization | null>(
    organization
  );

  const [name, setName] = useState<string>("Untitled Certificate");

  const updateWorkspace = (workspace: TOrganization | null) => {
    setWorkspace(workspace);
    setOrganization(workspace);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded flex-1 flex flex-col items-center justify-center px-2 py-12 bg-white border">
          <Image
            src={Certificate}
            alt={"certificate"}
            width={30}
            height={30}
            className="rounded-full"
          />
          <p className="font-medium text-sm">Create new certificate</p>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[50%]">
        <DialogHeader>
          <DialogTitle>Create Certificate</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">
              Certificate Name
            </label>
            <Input
              type="text"
              placeholder="Enter certificate name"
              className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
              onInput={(e) => setName(e.currentTarget.value)}
              value={name}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">Workspace</label>
            <div className="flex items-center gap-4">
              <Select
                disabled={workspacesIsLoading}
                value={String(workspace?.id)}
                onValueChange={(value) =>
                  updateWorkspace(
                    workspaces?.find(({ id }) => id === parseInt(value))
                  )
                }
              >
                <SelectTrigger className="w-full rounded-md bg-white font-medium">
                  <SelectValue placeholder={"Select workspace"} />
                </SelectTrigger>
                <SelectContent>
                  {workspaces?.map(({ id, organizationName }) => (
                    <SelectItem value={String(id)} key={id}>
                      {organizationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setDialogIsOpen(true)}
                className="bg-basePrimary gap-x-2 py-1 text-gray-50 font-medium flex items-center justify-center rounded-lg w-fit text-xs"
              >
                <span>New Workspace</span>
                <PlusCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              workspace && createCertificateFn({ name, workspace });
              setOpen(false);
            }}
            disabled={certificateIsCreating || name === "" || !workspace}
            className="mt-4 w-full gap-x-2 hover:bg-opacity-70 bg-basePrimary h-12 rounded-md text-gray-50 font-medium"
          >
            {certificateIsCreating && (
              <LoaderAlt size={22} className="animate-spin" />
            )}
            <span>Create Certificate</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Home = () => {
  const { user, setUser } = useUserStore();
  const { organization, setOrganization } = useOrganizationStore();
  const router = useRouter();

  const {
    data: workspaces,
    isLoading: workspacesIsLoading,
    getData: refetchWorkspaces,
  } = useGetData<TOrganization[]>(
    `/workspaces?userEmail=${user?.userEmail}`,
    
    []
  );
  // const router = useRouter();

  // if (!user) return router.push("/login");

  console.log(organization);

  const {
    data: certificates,
    isLoading: certificatesIsLoading,
    error,
  } = useGetData<TCertificate[]>(
    `/certificates?workspaceId=${organization?.id}`,
    
    []
  );

  const { createCertificate, isLoading: certificateIsCreating } =
    useCreateCertificate();

  const createCertificateFn = async ({
    name,
    workspace,
  }: {
    name: string;
    workspace: TOrganization;
  }) => {
    if (!organization) return toast.error("Please select an organization");
    const data = await createCertificate({
      payload: {
        workspaceAlias: workspace.organizationAlias,
        name,
        createdBy: user?.id,
      },
    });

    if (!data) return;

    router.push(
      `/credentials/create/${data.certificateAlias}?type=certificate&workspaceId=${workspace.id}`
    );
  };

  const [open, setOpen] = useState(false);

  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

  return (
    <section className="space-y-4">
      <div className="text-gray-700">
        <p>
          Hello, <b>{user?.firstName}</b>
        </p>
        <p className="text-sm text-gray-600">
          What will you be working on today?
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <CreateCertificateDialog
              open={open}
              setOpen={setOpen}
              createCertificateFn={createCertificateFn}
              certificateIsCreating={certificateIsCreating}
              setDialogIsOpen={() => {
                setOpen(false);
                setDialogIsOpen(true);
              }}
              workspaces={workspaces}
              workspacesIsLoading={workspacesIsLoading}
            />
            <button
              className="rounded flex-1 flex flex-col items-center justify-center px-2 py-12 bg-white border"
              disabled
            >
              <Image
                src={Badge}
                alt={"badge certificate"}
                width={30}
                height={30}
                className="rounded-full"
              />
              <p className="font-medium text-sm">Create new badge</p>
              <small className="text-xs text-gray-600">Coming soon</small>
            </button>
          </div>

          <div className="border rounded-md bg-white">
            <h2 className="text-sm text-gray-700 font-medium text-center py-2 border-b">
              My designs
            </h2>
            <div className="p-4">
              <Tabs defaultValue="certificates" className="w-full">
                <TabsList className="flex mx-auto w-1/2 mb-6">
                  <TabsTrigger
                    className="w-full data-[state=active]:bg-blue-700 group data-[state=active]:text-white flex gap-2"
                    value="certificates"
                  >
                    <span>Certificates</span>
                    <span className="rounded-full text-xs items-center justify-center group-data-[state=active]:bg-white group-data-[state=active]:text-blue-700 px-2 py-1 bg-gray-300 text-gray-600">
                      {certificates?.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    className="w-full data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                    value="badges"
                  >
                    Badges
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="certificates">
                  <div className="grid grid-cols-6 gap-4 mb-4">
                    {certificates?.slice(0, 6)?.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="rounded-lg border border-gray-200 bg-white"
                      >
                        <div className="h-[150px] w-full bg-gray-200 relative">
                          {certificate?.previewUrl && (
                            <Image
                              src={certificate?.previewUrl ?? ""}
                              alt={certificate.name}
                              objectFit="cover"
                              layout="fill"
                            />
                          )}
                        </div>
                        <div className="p-2 space-y-2">
                          <p className="font-medium text-gray-700 text-sm capitalize">
                            {certificate.name}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Image
                                src={Email}
                                alt={"email"}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                              <p className="text-xs text-gray-600">40</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Image
                                src={Calendar}
                                alt={"calendar"}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                              <p className="text-xs text-gray-600">
                                {format(certificate.created_at, "dd/MM/yyyy")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={"/designs"}
                    className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit text-sm"
                  >
                    See all
                  </Link>
                </TabsContent>
                <TabsContent value="badges">
                  Change your password here.
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      {dialogIsOpen && (
        <CreateOrganization
          refetch={refetchWorkspaces}
          close={() => {
            setDialogIsOpen(false);
            setOpen(true);
          }}
        />
      )}
    </section>
  );
};

export default Home;
