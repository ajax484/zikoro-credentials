"use client";
import React, { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useDeleteRequest, useGetData } from "@/hooks/services/request";
import {
  CertificateTemplate,
  CredentialType,
  TCertificate,
} from "@/types/certificates";
import Link from "next/link";
import Email from "@/public/icons/mdi_email-sent.svg";
import Calendar from "@/public/icons/duo-icons_calendar.svg";
import Solar from "@/public/icons/solar_pen-new-square-bold-duotone.svg";
import { format, set } from "date-fns";
import useSearch from "@/hooks/common/useSearch";
import useOrganizationStore from "@/store/globalOrganizationStore";
import SelectOrganization from "@/components/SelectOrganization/SelectOrganization";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { CredentialsWorkspaceToken } from "@/types/token";
import { useRouter } from "next/navigation";
import { TOrganization } from "@/types/organization";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOrganization } from "@/components/CreateOrganisation/createOrganisation";
import useUserStore from "@/store/globalUserStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Nib from "@/public/icons/iconoir_design-nib-solid2.svg";
import GradientText from "@/components/GradientText";
import { useFetchWorkspaces } from "@/queries/Workspaces.queries";
import {
  useFetchCertificates,
  useFetchCertificateTemplates,
  useFetchWorkspaceCertificates,
} from "@/queries/certificates.queries";
import CreateCertificateDialog from "@/components/modals/CreateCertificate.modal";
import {
  useCreateCertificate,
  useCreateTemplate,
  useDeleteCertificate,
} from "@/mutations/certificates.mutations";
import { Input } from "@/components/ui/input";
import {
  convertFromPixels,
  convertToPixels,
  getRandomNumber,
  uploadFile,
} from "@/utils/helpers";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  paperSeries,
  paperSizes,
} from "@/components/editor/components/settings-sidebar";
import { COLORS } from "@/components/editor/types";
import {
  DotsThreeOutlineVertical,
  PaperPlane,
  Pencil,
  Plus,
  PlusCircle,
  X,
} from "@phosphor-icons/react";
import ReactSelect from "react-select";
import GradientBorderSelect from "@/components/GradientBorderSelect";
import PaperPlaneIcon from "@/public/icons/PaperPlaneTilt_assign.svg";
import CertificateIcon from "@/public/icons/Certificate_assign.svg";
import IDBadgeIcon from "@/public/icons/idBadge_assign.svg";
import TagIcon from "@/public/icons/Tag_assign.svg";
import PackageIcon from "@/public/icons/Package_assign.svg";
import CancelIcon from "@/public/icons/ProhibitInset_assign.svg";
import { cn } from "@/lib/utils";
import { da } from "date-fns/locale";
import Pagination from "@/components/Pagination";

const categories = ["first", "second", "third", "fourth", "fifth"];

const CredentialTypeIcon: Record<CredentialType, string> = {
  certificate: CertificateIcon,
  badge: IDBadgeIcon,
  "product label": TagIcon,
  "shipping label": PackageIcon,
};

const creditTypeClassName = {
  silver:
    "[background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]",
  gold: "[background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]",
  bronze:
    "[background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]",
};

const Designs = () => {
  const { user, setUser } = useUserStore();
  const { organization, setOrganization } = useOrganizationStore();
  const router = useRouter();

  const {
    data: workspaces,
    isFetching: workspacesIsLoading,
    refetch: refetchWorkspaces,
    error: workspacesError,
  } = useFetchWorkspaces(user?.userEmail!);

  const { mutateAsync: createCertificate, isPending: certificateIsCreating } =
    useCreateCertificate();

  const createCertificateFn = async ({
    name,
    workspace,
    JSON,
    credentialType,
  }: {
    name: string;
    workspace: TOrganization;
    JSON: Record<string, any> | null;
    credentialType: CredentialType;
  }) => {
    if (!organization) return toast.error("Please select an organization");
    console.log(JSON);
    const data = await createCertificate({
      workspaceAlias: workspace.organizationAlias,
      name,
      createdBy: user?.id!,
      JSON,
      hasQRCode: !!JSON,
      credentialType,
    });

    console.log(data);
    if (!data) return;

    router.push(
      `/credentials/edit/${data.certificateAlias}?type=${data.credentialType}&workspaceId=${workspace.id}`
    );
  };

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [pagination, setPagination] = useState<{ page: number; limit: number }>(
    { page: 1, limit: 10 }
  );

  const updatePage = (page: number) => {
    setPagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setPagination({ page: 1, limit });
  };

  const { data: certificates, isFetching: certificatesIsLoading } =
    useFetchWorkspaceCertificates(
      organization?.organizationAlias!,
      pagination,
      searchTerm
    );

  console.log(certificates.limit, certificates.total);

  const { data: credits, isLoading: creditsIsLoading } = useGetData<
    CredentialsWorkspaceToken[]
  >(`/workspaces/${organization?.id}/credits`, []);

  console.log(credits);

  const [open, setOpen] = useState(false);

  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

  const creditBalance = {
    bronze: credits
      .filter((v) => v.tokenId === 1)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
    silver: credits
      .filter((v) => v.tokenId === 2)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
    gold: credits
      .filter((v) => v.tokenId === 3)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
  };

  const Delete = ({
    certificateAlias,
    setDeleteDialog,
    deleteDialog,
  }: {
    certificateAlias: string;
    setDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
    deleteDialog: boolean;
  }) => {
    const { mutateAsync: deleteCertificate, isPending: isDeleting } =
      useDeleteCertificate(certificateAlias);

    const certificate = certificates?.data?.find(
      (certificate) => certificate.certificateAlias === certificateAlias
    );

    const clsBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent
          className="px-4 py-6 z-[1000]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-3">
            <DialogTitle></DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              <svg
                width={57}
                height={50}
                viewBox="0 0 57 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M55.6998 41.0225L33.8373 3.05501C33.2909 2.12482 32.511 1.35356 31.5748 0.817663C30.6385 0.281767 29.5785 -0.000152588 28.4998 -0.000152588C27.421 -0.000152588 26.361 0.281767 25.4247 0.817663C24.4885 1.35356 23.7086 2.12482 23.1623 3.05501L1.29975 41.0225C0.774092 41.9222 0.49707 42.9455 0.49707 43.9875C0.49707 45.0295 0.774092 46.0528 1.29975 46.9525C1.83908 47.8883 2.61768 48.6638 3.55566 49.1993C4.49363 49.7349 5.55721 50.0112 6.63725 50H50.3623C51.4414 50.0103 52.504 49.7336 53.441 49.1981C54.378 48.6626 55.1558 47.8876 55.6948 46.9525C56.2212 46.0532 56.4991 45.0302 56.4999 43.9882C56.5008 42.9462 56.2247 41.9227 55.6998 41.0225ZM52.2323 44.95C52.0417 45.2751 51.768 45.5437 51.4394 45.7282C51.1108 45.9127 50.7391 46.0065 50.3623 46H6.63725C6.26044 46.0065 5.88868 45.9127 5.56008 45.7282C5.23147 45.5437 4.95784 45.2751 4.76725 44.95C4.59461 44.6577 4.50355 44.3245 4.50355 43.985C4.50355 43.6455 4.59461 43.3123 4.76725 43.02L26.6298 5.05251C26.8242 4.72894 27.0991 4.4612 27.4276 4.27532C27.7562 4.08944 28.1273 3.99175 28.5048 3.99175C28.8822 3.99175 29.2533 4.08944 29.5819 4.27532C29.9104 4.4612 30.1853 4.72894 30.3798 5.05251L52.2423 43.02C52.4134 43.3132 52.5027 43.6469 52.501 43.9864C52.4992 44.3258 52.4064 44.6586 52.2323 44.95ZM26.4998 30V20C26.4998 19.4696 26.7105 18.9609 27.0855 18.5858C27.4606 18.2107 27.9693 18 28.4998 18C29.0302 18 29.5389 18.2107 29.914 18.5858C30.289 18.9609 30.4998 19.4696 30.4998 20V30C30.4998 30.5304 30.289 31.0392 29.914 31.4142C29.5389 31.7893 29.0302 32 28.4998 32C27.9693 32 27.4606 31.7893 27.0855 31.4142C26.7105 31.0392 26.4998 30.5304 26.4998 30ZM31.4998 39C31.4998 39.5934 31.3238 40.1734 30.9942 40.6667C30.6645 41.1601 30.196 41.5446 29.6478 41.7716C29.0996 41.9987 28.4964 42.0581 27.9145 41.9424C27.3325 41.8266 26.798 41.5409 26.3784 41.1213C25.9589 40.7018 25.6732 40.1672 25.5574 39.5853C25.4416 39.0033 25.5011 38.4001 25.7281 37.852C25.9552 37.3038 26.3397 36.8352 26.833 36.5056C27.3264 36.176 27.9064 36 28.4998 36C29.2954 36 30.0585 36.3161 30.6211 36.8787C31.1837 37.4413 31.4998 38.2044 31.4998 39Z"
                  fill="#001FCC"
                />
              </svg>
              <div className="text-zikoroBlack font-medium flex flex-col gap-2 text-center">
                <span>
                  Are you sure you want to delete {certificate?.name}? This will
                  delete all related issued certificates.
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={isDeleting}
                onClick={(e) => {
                  clsBtnRef.current?.click();
                }}
                className="border-2 bg-white border-basePrimary text-basePrimary w-full"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeleting}
                onClick={async (e) => {
                  await deleteCertificate();
                  clsBtnRef.current?.click();
                }}
                className="bg-basePrimary w-full"
              >
                Delete
              </Button>
            </div>
          </div>
          <DialogClose asChild>
            <button className="hidden" ref={clsBtnRef}>
              close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  };

  const {
    data: certificateTemplates,
    isFetching: certificateTemplatesIsLoading,
  } = useFetchCertificateTemplates();

  console.log(certificateTemplates);

  interface ConvertToTemplateProps {
    certificateAlias: string;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
    openDialog: boolean;
  }

  const ConvertToTemplate: React.FC<ConvertToTemplateProps> = ({
    certificateAlias,
    setOpenDialog,
    openDialog,
  }) => {
    const { mutateAsync: createTemplate, isPending: isCreating } =
      useCreateTemplate();
    const certificate = certificates?.data?.find(
      (certificate) => certificate.certificateAlias === certificateAlias
    );

    if (!certificate) {
      return <div className="text-red-500">Certificate not found</div>;
    }

    const clsBtnRef = useRef<HTMLButtonElement>(null);

    const [template, setTemplate] = useState<Partial<CertificateTemplate>>({
      name: certificate.name,
      attributes: certificate.attributes,
      JSON: certificate.JSON?.json!,
      previewUrl: certificate.previewUrl,
      credentialType: certificate.credentialType,
      sourceId: user?.id!,
      tags: ["user created"],
      paperSize: certificate.paperSize,
      category: [],
      certificateId: certificate.id,
    });

    const [previewUrlUploading, setPreviewUrlUploading] = useState(false);

    const uploadDocumentFn = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PNG or JPEG file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setPreviewUrlUploading(true);

      const { url, error } = await uploadFile(file, "image");

      if (error) {
        toast.error(error);
        setPreviewUrlUploading(false);
        return;
      }

      if (url) {
        setTemplate((prev) => ({
          ...prev,
          previewUrl: url,
        }));
      }

      setPreviewUrlUploading(false);
    };

    const [newCategory, setNewCategory] = useState("");

    console.log(template.category);

    return (
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent
          className="px-4 py-6 z-[1000]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Convert to Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="name" className="font-medium text-gray-700">
                Template name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter template name"
                className="h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                value={template.name}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {!previewUrlUploading ? (
              <label
                htmlFor="previewUrl"
                className="relative bg-basePrimary/10 rounded-lg p-8 flex flex-col gap-2 items-center cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <b className="text-sm">
                  Upload a preview image of your template
                </b>
                <div className="text-blue-600 underline text-sm">
                  {template.previewUrl ? (
                    <span className="max-w-full truncate">
                      {certificate.name + ".png"}
                    </span>
                  ) : (
                    <span>Upload Preview Image</span>
                  )}
                  <input
                    id="previewUrl"
                    name="previewUrl"
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg"
                    onChange={uploadDocumentFn}
                    disabled={previewUrlUploading}
                  />
                </div>
                <p className="text-gray-700 text-xs">Accepts PNG, JPEG</p>
              </label>
            ) : (
              <div className="size-8 border-2 border-gray-300 rounded-full animate-spin border-t-black mx-auto my-8" />
            )}

            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="category" className="font-medium text-gray-700">
                Category
              </label>
              <GradientBorderSelect
                isMulti
                onChange={(value) =>
                  setTemplate((prev) => ({
                    ...prev,
                    category: Array.isArray(value)
                      ? (value as string[])
                      : typeof value === "string"
                      ? [value]
                      : [],
                  }))
                }
                options={categories.map((category) => ({
                  label: category,
                  value: category,
                }))}
                defaultValue={template.category}
              />
            </div>

            <div className="flex gap-2">
              <Button
                disabled={isCreating}
                onClick={() => clsBtnRef.current?.click()}
                variant={"secondary"}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                disabled={isCreating}
                onClick={async () => {
                  await createTemplate(template);
                  clsBtnRef.current?.click();
                }}
                className="flex-1"
              >
                Proceed
              </Button>
            </div>
          </div>
          <DialogClose asChild>
            <button className="hidden" ref={clsBtnRef}>
              close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  };

  const CertificateCard = ({ certificate }: { certificate: TCertificate }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    return (
      <div
        key={certificate.id}
        className="rounded-lg border border-gray-200 bg-white group relative"
      >
        <div className="h-[250px] w-full bg-gray-200 relative">
          {certificate?.previewUrl && (
            <Image
              src={certificate?.previewUrl ?? ""}
              alt={certificate.name}
              objectFit="cover"
              layout="fill"
            />
          )}
          {/* <div className="absolute inset-0 p-2 bg-black/50 group-hover:flex hidden z-10 group-hover:gap-8 group-hover:justify-center group-hover:items-center">
            <Link
              className="text-gray-50 hover:text-basePrimary"
              href={
                "/credentials/edit/" +
                certificate.certificateAlias +
                "?type=certificate&workspaceId=" +
                organization?.id +
                "&workspaceAlias=" +
                organization?.organizationAlias
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="m14.06 9.02l.92.92L5.92 19H5v-.92zM17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"
                />
              </svg>
            </Link>
            <Link
              className="text-gray-50 hover:text-basePrimary"
              href={"/assign?certificateAlias=" + certificate.certificateAlias}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8"
                />
              </svg>
            </Link>
          </div> */}
        </div>
        <div className="relative">
          <div key={certificate.id} className="group p-2">
            <h2 className="font-semibold text-zikoroBlack text-sm capitalize mb-2">
              {certificate.name}
            </h2>
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center gap-1 flex-1">
                <Image
                  src={
                    CredentialTypeIcon[
                      certificate.credentialType ?? "certificate"
                    ]
                  }
                  alt={"credential type"}
                  width={16}
                  height={16}
                  className="rounded-full"
                />
                <p className="text-zikoroGray flex-1">
                  {certificate.credentialType ?? "certificate"}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-1">
                <div
                  className={cn(
                    "rounded-full size-4 [box-shadow:_0px_8px_12px_0px_#C2AF9B66;]",
                    creditTypeClassName[
                      certificate?.attributes &&
                      certificate?.attributes.length > 0
                        ? "gold"
                        : certificate?.hasQRCode
                        ? "silver"
                        : "bronze"
                    ]
                  )}
                />
                <p className="text-zikoroGray capitalize flex-1">
                  {certificate?.attributes && certificate?.attributes.length > 0
                    ? "gold"
                    : certificate?.hasQRCode
                    ? "silver"
                    : "bronze"}
                </p>
              </div>
            </div>
            <div className="flex items-center divide-x-2">
              <div className="flex items-center gap-1 pr-2">
                <Image
                  src={PaperPlaneIcon}
                  alt={"email"}
                  width={16}
                  height={16}
                />
                <span className="text-sm text-zikoroBlack">
                  {certificate?.recipientCount}
                </span>
                <span className="text-sm text-zikoroGray">Assigned</span>
              </div>
              <div className="flex items-center gap-1 pl-2 flex-1">
                <Image src={CancelIcon} alt={"cancel"} width={16} height={16} />
                <span className="text-sm text-zikoroBlack">
                  {certificate?.failedRecipientCount}
                </span>
                <span className="text-sm text-zikoroGray">Cancelled</span>
              </div>
            </div>
          </div>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="More options"
                className="p-2 z-[10] absolute top-0 right-0"
              >
                <DotsThreeOutlineVertical
                  size={16}
                  className="text-zikoroBlack"
                  weight="regular"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="w-full">
                <button
                  className="w-full hover:bg-gray-100 text-gray-700 py-2"
                  onClick={(e) => {
                    organization &&
                      createCertificateFn({
                        name: certificate.name + " (copy)",
                        workspace: organization,
                        JSON: certificate.JSON,
                        credentialType: certificate.credentialType,
                      });
                    setDropdownOpen(false);
                  }}
                >
                  <span className="p-2">Make a copy</span>
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDialog(true);
                  setDropdownOpen(false);
                }}
                className="text-center p-2 hover:bg-gray-100 text-gray-700"
              >
                <button className="w-full hover:bg-gray-100 text-gray-700 p-2">
                  Convert to Template
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-center p-2 hover:bg-gray-100 text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog(true);
                  setDropdownOpen(false);
                }}
              >
                <button className="w-full hover:bg-gray-100 text-red-700">
                  <span className="p-2">Delete</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Delete
            certificateAlias={certificate.certificateAlias}
            setDeleteDialog={setDeleteDialog}
            deleteDialog={deleteDialog}
          />
          <ConvertToTemplate
            certificateAlias={certificate.certificateAlias}
            setOpenDialog={setOpenDialog}
            openDialog={openDialog}
          />
        </div>
        <div className="flex justify-center items-center p-2 gap-1">
          <Link
            href={`/credentials/edit/${certificate.certificateAlias}?type=${certificate.credentialType}&workspaceId=${organization?.id}`}
            className="border rounded-md flex justify-center items-center gap-2 bg-white px-4 py-2 text-sm text-zikoroGray w-full"
          >
            <Pencil size={16} className="text-zikoroGray" weight="bold" />
            Edit
          </Link>
          <Link
            href={`/designs/${certificate.certificateAlias}/assign`}
            className="border rounded-md flex justify-center items-center gap-2 bg-white px-4 py-2 text-sm text-zikoroGray w-full"
          >
            <PaperPlane size={16} className="text-zikoroGray" weight="bold" />
            Assign
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex md:justify-between md:items-center mb-12 flex-col md:flex-row gap-y-4">
        <div>
          <h1 className="text-xl text-zikoroBlack font-semibold">
            All Credentials
          </h1>
          <p className="text-zikoroGray text-sm">
            Easily view, issue and update all your credentials
          </p>
        </div>
        <SelectOrganization />
      </div>
      {/* <div className="bg-basePrimary/10 text-[#1F1F1F] px-1 py-4 rounded-xl space-y-2 border w-1/2 mx-auto my-6">
        <div className="mb-4 space-y-2">
          <h3 className="text-lg text-gray-700 font-semibold py-2 text-center">
            Current Credit Information
          </h3>
          <div className="flex gap-8 justify-center">
            <div>
              <span className="font-medium">Bronze</span>
              <div className="flex gap-x-1 items-center">
                <div className="rounded-full p-0.5 [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]">
                  <div className="rounded-full size-5 [box-shadow:_0px_8px_12px_0px_#C2AF9B66;] [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]" />
                </div>
                <span className="font-semibold">{creditBalance.bronze}</span>
              </div>
            </div>
            <div>
              <span className="font-medium">Silver</span>
              <div className="flex gap-x-1">
                <div className="rounded-full p-0.5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]">
                  <div className="rounded-full size-5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]" />
                </div>
                <span className="font-semibold">{creditBalance.silver}</span>
              </div>
            </div>
            <div>
              <span className="font-medium">Gold</span>
              <div className="flex gap-x-1">
                <div className="rounded-full p-0.5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]">
                  <div className="rounded-full size-5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]" />
                </div>
                <span className="font-semibold">{creditBalance.gold}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center font-medium text-zikoroBlack text-sm">
          You need credits to issue credentials.
        </p>
        <Link
          href={"/credits/buy"}
          className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit capitalize text-xs"
        >
          Buy more credits
        </Link>
      </div> */}
      <div className="flex justify-between items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onInput={(event) => setSearchTerm(event.currentTarget.value)}
          className="placeholder:text-sm placeholder:text-gray-400 text-gray-700 bg-transparent px-4 py-2 w-full md:w-1/3 border-b focus-visible:outline-none mx-auto"
        />
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
          triggerButton={
            <Button
              type="button"
              className="bg-basePrimary text-white flex items-center gap-2 justify-center"
              disabled={certificateIsCreating}
            >
              <PlusCircle size={24} className="text-white" weight="bold" />
              <span className="hidden md:inline">New Credential</span>
            </Button>
          }
        />
      </div>
      {!certificatesIsLoading && certificates?.data?.length === 0 ? (
        <>
          <div className="flex flex-col justify-center items-center h-[250px] gap-4">
            <div className="bg-basePrimary rounded-full p-6">
              <Image
                src={Nib}
                alt="nib"
                width={30}
                height={30}
                className="rounded-full"
              />
            </div>
            <GradientText className="font-bold text-2xl" Tag={"h1"}>
              No certificates found
            </GradientText>
            <p className="text-zikoroBlack text-sm font-medium">
              Get started by creating your first certificate
            </p>
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
              triggerButton={
                <Button
                  type="button"
                  className="bg-basePrimary text-white"
                  disabled={certificateIsCreating}
                >
                  Start Creating
                </Button>
              }
            />
          </div>
        </>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-4">
          {certificatesIsLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              {certificates?.data?.map((certificate) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                />
              ))}
            </>
          )}
        </div>
      )}
      <Pagination
        totalDocs={certificates.total}
        currentPage={certificates.page}
        setCurrentPage={updatePage}
        limit={certificates.limit!}
        isLoading={certificatesIsLoading}
      />
      {dialogIsOpen && (
        <CreateOrganization
          refetch={refetchWorkspaces}
          close={() => {
            setDialogIsOpen(false);
            setOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default Designs;
