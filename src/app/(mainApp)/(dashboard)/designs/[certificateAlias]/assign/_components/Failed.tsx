import { DataTable } from "@/components/DataTable/data-table";
import Filter from "@/components/Filter";
import { Button } from "@/components/ui/button";
import { useFilter } from "@/hooks";
import useSearch from "@/hooks/common/useSearch";
import {
  CertificateRecipient,
  FailedCertificateRecipient,
  TCertificate,
} from "@/types/certificates";
import { TFilter } from "@/types/filter";
import { convertCamelToNormal, extractUniqueTypes } from "@/utils/helpers";
import { Send, Trash } from "lucide-react";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { PiExport } from "react-icons/pi";
import { failedColumns, issueesColumns } from "./columns";
import logo from "@/public/icons/logo.svg";
import excel from "@/public/icons/vscode-icons_file-type-excel.svg";
import penPaper from "@/public/icons/clarity_form-line.svg";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import GradientBorderSelect from "@/components/CustomSelect/GradientSelectBorder";
import { useRouter } from "next/navigation";
import { RowSelectionState } from "@tanstack/react-table";
import Link from "next/link";
import {
  Pagination,
  useGetData,
  useMutateData,
} from "@/hooks/services/request";
import * as XLSX from "xlsx";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { format } from "date-fns";
import { CredentialsWorkspaceToken } from "@/types/token";
import AccountCancel from "@/public/icons/mdi_account-cancel.svg";
import ExportFill from "@/public/icons/ph_export-fill.svg";
import SendIcon from "@/public/icons/fa_send.svg";
import GradientText from "@/components/GradientText";
import { Input } from "@/components/ui/input";
import {
  useRecallCertificates,
  useReIssueCertificates,
  useResendCertificates,
} from "@/mutations/certificates.mutations";
import debounce from "lodash.debounce";

const issueesFilter: TFilter<FailedCertificateRecipient>[] = [
  {
    label: "Issue Date",
    accessor: "created_at",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={25}
        height={24}
        viewBox="0 0 25 24"
        fill="none"
      >
        <path
          d="M9.27979 11H7.27979V13H9.27979V11ZM13.2798 11H11.2798V13H13.2798V11ZM17.2798 11H15.2798V13H17.2798V11ZM19.2798 4H18.2798V2H16.2798V4H8.27979V2H6.27979V4H5.27979C4.16979 4 3.28979 4.9 3.28979 6L3.27979 20C3.27979 20.5304 3.4905 21.0391 3.86557 21.4142C4.24064 21.7893 4.74935 22 5.27979 22H19.2798C20.3798 22 21.2798 21.1 21.2798 20V6C21.2798 4.9 20.3798 4 19.2798 4ZM19.2798 20H5.27979V9H19.2798V20Z"
          fill="#717171"
        />
      </svg>
    ),
    type: "dateSingle",
    order: 1,
  },
  {
    label: "Status",
    type: "multiple",
    order: 2,
    icon: (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth={0}
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20,3H4C3.447,3,3,3.448,3,4v16c0,0.552,0.447,1,1,1h16c0.553,0,1-0.448,1-1V4C21,3.448,20.553,3,20,3z M19,19H5V5h14V19z" />
        <path d="M11 7H13V9H11zM11 11H13V17H11z" />
      </svg>
    ),
    accessor: "status",
    optionsFromData: true,
  },
];

const Failed = ({
  certificates,
  certificateIssuees,
  updatePage,
  total,
  pagination,
  isLoading,
  certificateAlias,
  updateLimit,
  searchTerm,
  setSearchTerm,
}: {
  certificates: TCertificate[];
  certificateIssuees: FailedCertificateRecipient[];
  total: number;
  totalPages: number;
  pagination: Pagination;
  updatePage: (page: number) => void;
  isLoading: boolean;
  certificateAlias: string;
  updateLimit: (limit: number) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}) => {
  const router = useRouter();

  const { organization } = useOrganizationStore();

  console.log(certificateIssuees);

  const {
    filteredData: filteredIssuees,
    filters,
    selectedFilters,
    applyFilter,
    setOptions,
  } = useFilter<FailedCertificateRecipient>({
    data: certificateIssuees,
    dataFilters: issueesFilter,
  });

  useEffect(() => {
    if (isLoading) return;
    filters
      .filter((filter) => filter.optionsFromData)
      .forEach(({ accessor }) => {
        setOptions(
          accessor,
          extractUniqueTypes<FailedCertificateRecipient>(
            certificateIssuees,
            accessor
          )
        );
      });
    // }, []);
  }, [isLoading]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  console.log(rowSelection);

  const { mutateAsync: recallCertificates, isPending: isLoadingRecall } =
    useRecallCertificates(organization?.organizationAlias!);

  const { mutateAsync: reIssueCertificates, isPending: isLoadingReissue } =
    useReIssueCertificates(organization?.organizationAlias!);

  const { mutateAsync: resendCertificates, isPending: isLoadingResend } =
    useResendCertificates(organization?.organizationAlias!);

  const ToggleStatus = () => {
    const clsBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm",
              filteredIssuees.filter(({ id }) => rowSelection[id]).length ===
                0 ||
                (!filteredIssuees
                  .filter(({ id }) => rowSelection[id])
                  .every(({ isValid }) => isValid) &&
                  !filteredIssuees
                    .filter(({ id }) => rowSelection[id])
                    .every(({ isValid }) => !isValid)) ||
                isLoadingRecall ||
                isLoadingReissue
                ? "border-gray-600 text-gray-600"
                : "border-red-600  text-red-600"
            )}
            disabled={
              filteredIssuees.filter(({ id }) => rowSelection[id]).length ===
                0 ||
              (!filteredIssuees
                .filter(({ id }) => rowSelection[id])
                .every(({ isValid }) => isValid) &&
                !filteredIssuees
                  .filter(({ id }) => rowSelection[id])
                  .every(({ isValid }) => !isValid)) ||
              isLoadingRecall ||
              isLoadingReissue
            }
          >
            <Trash className="size-4" />
            <span>
              {filteredIssuees
                .filter(({ id }) => rowSelection[id])
                .every(({ isValid }) => isValid)
                ? "Revoke"
                : "Reissue"}
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="px-4 py-6 z-[1000]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              {filteredIssuees
                .filter(({ id }) => rowSelection[id])
                .every(({ isValid }) => isValid) ? (
                <Trash className="size-12 text-red-600" />
              ) : (
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
              )}
              <h2 className="font-semibold text-center">
                {" "}
                {filteredIssuees
                  .filter(({ id }) => rowSelection[id])
                  .every(({ isValid }) => isValid)
                  ? "Revoke"
                  : "Reissue"}{" "}
                Credentials
              </h2>
              <div className="text-gray-800 font-medium flex flex-col gap-2 text-center">
                <span>
                  Are you sure you want to{" "}
                  {filteredIssuees
                    .filter(({ id }) => rowSelection[id])
                    .every(({ isValid }) => isValid)
                    ? "revoke"
                    : "reissue"}{" "}
                  these credentials?
                </span>
              </div>
            </div>
            <div className="flex w-full">
              <Button
                disabled={isLoadingRecall || isLoadingReissue}
                onClick={async (e) => {
                  e.stopPropagation();
                  await toggleCertificatesFn();
                  clsBtnRef.current?.click();
                }}
                className={cn(
                  "px-4 mx-auto",
                  filteredIssuees
                    .filter(({ id }) => rowSelection[id])
                    .every(({ isValid }) => isValid)
                    ? "bg-red-600"
                    : "bg-basePrimary"
                )}
              >
                {filteredIssuees
                  .filter(({ id }) => rowSelection[id])
                  .every(({ isValid }) => isValid)
                  ? "Revoke"
                  : "Reissue"}
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

  const Resend = () => {
    const clsBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm",
              filteredIssuees.filter(({ id }) => rowSelection[id]).length === 0
                ? "border-gray-600 text-gray-600"
                : "border-basePrimary text-basePrimary"
            )}
            disabled={
              filteredIssuees.filter(({ id }) => rowSelection[id]).length ===
                0 ||
              isLoadingRecall ||
              isLoadingReissue ||
              isLoadingResend
            }
          >
            <Send className="size-4" />
            <span>Resend</span>
          </button>
        </DialogTrigger>
        <DialogContent className="px-4 py-6 z-[1000]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              <Image src={SendIcon} alt="resend" width={40} height={40} />
              <h2 className="font-semibold text-center"> Resend Credentials</h2>
              <div className="text-gray-800 font-medium flex flex-col gap-2 text-center">
                <span>Are you sure you want to resend these credentials?</span>
              </div>
            </div>
            <div className="flex w-full">
              <Button
                disabled={isLoadingRecall || isLoadingReissue}
                onClick={async (e) => {
                  e.stopPropagation();
                  await resendCertificatesFn();
                  clsBtnRef.current?.click();
                }}
                className={cn("px-4 mx-auto", "bg-basePrimary")}
              >
                resend
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

  const ExportRecipients = () => {
    const [name, setName] = useState<string>(
      `credentials_recipients_${
        organization?.organizationName
      }_${new Date().toISOString()}`
    );
    const clsBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm",
              filteredIssuees.filter(({ id }) => rowSelection[id]).length === 0
                ? "border-gray-600 text-gray-600"
                : "border-basePrimary text-basePrimary"
            )}
            disabled={
              filteredIssuees.filter(({ id }) => rowSelection[id]).length ===
                0 ||
              isLoadingRecall ||
              isLoadingReissue ||
              isLoadingResend
            }
            // onClick={exportRecipients}
          >
            <PiExport className="size-4" />
            <span>Export</span>
          </button>
        </DialogTrigger>
        <DialogContent className="px-4 py-6 z-[1000]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              <Image src={ExportFill} alt="export" width={40} height={40} />
              <h2 className="font-semibold text-center">Export Credentials</h2>
            </div>
            <div className="relative w-full">
              <Input
                placeholder="file name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
              />
            </div>
            <div className="flex w-full">
              <Button
                disabled={isLoadingRecall || isLoadingReissue}
                onClick={async (e) => {
                  e.stopPropagation();
                  await exportRecipientsFn(name);
                  clsBtnRef.current?.click();
                }}
                className={cn("px-4 mx-auto", "bg-basePrimary")}
              >
                Export
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

  const toggleCertificatesFn = async () => {
    const toggleFn = filteredIssuees
      .filter(({ id }) => rowSelection[id])
      .every(({ isValid }) => isValid)
      ? recallCertificates
      : reIssueCertificates;

    await toggleFn({
      ids: filteredIssuees
        .filter(({ id }) => rowSelection[id])
        .map(({ id }) => id),
    });
    updatePage(1);
  };

  const resendCertificatesFn = async () => {
    await resendCertificates({
      recipients: filteredIssuees
        .filter(({ id }) => rowSelection[id])
        .map(({ id, statusDetails }) => ({
          id,
          statusDetails,
        })),
    });
    updatePage(1);
  };

  const exportRecipientsFn = (
    name = `credentials_recipients_${
      organization?.organizationName
    }_${new Date().toISOString()}`
  ) => {
    const omittedFields: (keyof (CertificateRecipient & {
      certificate: TCertificate;
    }))[] = ["certificateId", "certificateGroupId", "id", "statusDetails"];

    const normalizedData = convertCamelToNormal<
      CertificateRecipient & {
        certificate: TCertificate;
      }
    >(
      filteredIssuees.map((obj) =>
        Object.keys(obj).reduce(
          (newObj, key) => {
            if (
              !omittedFields.includes(
                key as keyof (CertificateRecipient & {
                  certificate: TCertificate;
                })
              )
            ) {
              (newObj as any)[key] =
                key === "created_at"
                  ? obj[key]
                    ? format(new Date(obj[key]), "MM/dd/yyyy")
                    : "N/A"
                  : key === "certificate"
                  ? obj[key].name
                  : (obj as any)[key];
            }
            return newObj;
          },
          {} as Partial<
            CertificateRecipient & {
              certificate: TCertificate;
            }
          >
        )
      ) as (CertificateRecipient & {
        certificate: TCertificate;
      })[],
      " "
    );

    const worksheet = XLSX.utils.json_to_sheet(normalizedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${name}.xlsx`);
  };

  console.log(filteredIssuees);

  const debouncedSearch = useCallback(
    (searchTerm: string) => {
      debounce(setSearchTerm(searchTerm), 300);
    },
    [searchTerm]
  );

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        {/* <div className="flex gap-2 items-center">
          <ToggleStatus />
          <ExportRecipients />
          <Resend />
        </div> */}
        <div className="flex items-center justify-center gap-2 ml-auto">
          <Link
            href={"/credits/buy"}
            className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit capitalize text-sm"
          >
            Buy more credits
          </Link>
        </div>
      </div>
      {!isLoading && certificateIssuees.length === 0 && searchTerm === "" ? (
        <div className="flex flex-col items-center justify-center gap-4 text-gray-600 h-[250px]">
          <div className="bg-basePrimary rounded-full p-6">
            <Image src={AccountCancel} width={40} height={40} alt="logo" />
          </div>
          <GradientText className="font-bold text-2xl" Tag={"h1"}>
            No Failed Assignments Yet
          </GradientText>
          <p className="text-gray-800 text-sm font-medium">
            the list of failed assignments will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-center items-end">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onInput={(event) => {
                debouncedSearch(event.currentTarget.value);
              }}
              className="placeholder:text-sm placeholder:text-gray-400 text-gray-700 bg-transparent px-4 py-2 w-1/3 border-b focus-visible:outline-none"
            />
            <Filter
              className={`space-y-4 w-1/3 mx-auto hide-scrollbar`}
              filters={filters.sort(
                (a, b) => (a.order || Infinity) - (b.order || Infinity)
              )}
              applyFilter={applyFilter}
              selectedFilters={selectedFilters}
            />
            <GradientBorderSelect
              placeholder="Select limit"
              value={pagination.limit.toString()}
              onChange={(value: string) => updateLimit(parseInt(value))}
              options={[10, 50, 100, 1000].map((limit) => ({
                label: limit.toString(),
                value: limit.toString(),
              }))}
            />
          </div>
          <DataTable<FailedCertificateRecipient>
            columns={failedColumns}
            data={filteredIssuees}
            currentPage={pagination.page}
            setCurrentPage={updatePage}
            limit={pagination.limit}
            refetch={() => {}}
            totalDocs={total}
            isFetching={isLoading}
            onClick={() => {}}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </>
      )}
    </section>
  );
};

export default Failed;
