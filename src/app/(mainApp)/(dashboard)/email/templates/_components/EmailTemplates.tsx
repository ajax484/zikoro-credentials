"use client";
import { DataTable } from "@/components/DataTable/data-table";
import { useGetPaginatedData, useMutateData } from "@/hooks/services/request";
import useOrganizationStore from "@/store/globalOrganizationStore";
import useUserStore from "@/store/globalUserStore";
import { RecipientEmailTemplate } from "@/types/certificates";
import { RowSelectionState } from "@tanstack/react-table";
import React, { useState } from "react";
import { columns } from "./columns";
import useSearch from "@/hooks/common/useSearch";
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
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { generateAlphanumericHash } from "@/utils/helpers";
import { TUser } from "@/types/user";

const CreateTemplateDialog = ({
  open,
  setOpen,
  createTemplateFn,
  templateIsCreating,
  triggerButton,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  createTemplateFn: ({
    name,
    workspace,
  }: {
    name: string;
    workspace: TOrganization;
  }) => void;
  templateIsCreating: boolean;
  triggerButton: React.ReactNode;
}) => {
  const { organization, setOrganization } = useOrganizationStore();

  const [name, setName] = useState<string>("Untitled template");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-[50%]">
        <DialogHeader>
          <DialogTitle>Create Email Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">Template Name</label>
            <Input
              type="text"
              placeholder="Enter template name"
              className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
              onInput={(e) => setName(e.currentTarget.value)}
              value={name}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              organization &&
                createTemplateFn({ name, workspace: organization });
              setOpen(false);
            }}
            disabled={templateIsCreating || name === "" || !organization}
            className="mt-4 w-full gap-x-2 hover:bg-opacity-70 bg-basePrimary h-12 rounded-md text-gray-50 font-medium"
          >
            {templateIsCreating && (
              <LoaderAlt size={22} className="animate-spin" />
            )}
            <span>Create Template</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EmailTemplates = () => {
  const { organization } = useOrganizationStore();
  const { user } = useUserStore();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const router = useRouter();

  const searchParams = new URLSearchParams({
    workspaceAlias: organization?.organizationAlias || "",
  });

  const {
    data: templates,
    isLoading: isLoadingTemplates,
    total,
    totalPages,
    pagination,
    setPagination,
    getData: getTemplates,
  } = useGetPaginatedData<RecipientEmailTemplate & { user: TUser }>(
    `/certificates/recipients/templates`,
    searchParams
  );

  console.log(templates);

  const { mutateData: createTemplate, isLoading: templateIsCreating } =
    useMutateData(`/certificates/recipients/templates`);

  const updatePage = (page: number) => {
    setPagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setPagination({ page: 1, limit });
  };

  const {
    searchTerm,
    searchedData: filteredTemplates,
    setSearchTerm,
  } = useSearch<RecipientEmailTemplate & { user: TUser }>({
    data: templates || [],
    accessorKey: ["templateName", "subject"],
  });

  const [open, setOpen] = useState(false);

  const createTemplateFn = async ({ name }: { name: string }) => {
    if (!organization) return toast.error("Please select an organization");

    const templateAlias = generateAlphanumericHash(12);

    const data = await createTemplate({
      payload: {
        workspaceAlias: organization.organizationAlias,
        templateName: name,
        createdBy: user?.id,
        showLogo: false,
        showSocialLinks: false,
        subject: "Your certificate is ready for download",
        senderName: "Event team",
        replyTo: "",
        logoUrl: organization?.organizationLogo || "",
        body: `
        Dear #{first_name#},\n

          Great news, your certificate is ready for download. Access it now through this link: View Certificate\n

          Congratulations!\n

          Best,\n

          Team.`,
        templateAlias,
      },
    });

    if (!data) return;

    console.log(data);

    router.push("/email/templates/" + data.templateAlias);

    await getTemplates();
  };

  const templateColumns = columns(
    getTemplates,
    createTemplateFn,
    templateIsCreating
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onInput={(event) => setSearchTerm(event.currentTarget.value)}
          className="placeholder:text-sm placeholder:text-gray-400 text-gray-700 bg-transparent px-4 py-2 w-1/3 border-b focus-visible:outline-none"
        />
        <div className="flex items-center gap-2">
          <CreateTemplateDialog
            templateIsCreating={templateIsCreating}
            open={open}
            setOpen={setOpen}
            createTemplateFn={createTemplateFn}
            triggerButton={
              <Button
                type="button"
                className="bg-basePrimary text-white"
                disabled={isLoadingTemplates || templateIsCreating}
              >
                New template
              </Button>
            }
          />
        </div>
      </div>
      <DataTable<RecipientEmailTemplate & { user: TUser }>
        columns={templateColumns}
        data={filteredTemplates}
        currentPage={pagination.page}
        setCurrentPage={updatePage}
        limit={pagination.limit}
        refetch={() => {}}
        totalDocs={total}
        isFetching={isLoadingTemplates}
        onClick={() => {}}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
};

export default EmailTemplates;
