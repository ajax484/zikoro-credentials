import { DataTable } from "@/components/DataTable/data-table";
import Filter from "@/components/Filter";
import { Button } from "@/components/ui/button";
import { useFilter } from "@/hooks";
import useSearch from "@/hooks/common/useSearch";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { TFilter } from "@/types/filter";
import { convertCamelToNormal, extractUniqueTypes } from "@/utils/helpers";
import { Send, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { PiExport } from "react-icons/pi";
import { issueesColumns } from "./columns";
import logo from "@/public/icons/logo.svg";
import excel from "@/public/icons/vscode-icons_file-type-excel.svg";
import penPaper from "@/public/icons/clarity_form-line.svg";
import Image from "next/image";
import {
  Dialog,
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

const issueesFilter: TFilter<
  CertificateRecipient & { certificate: TCertificate }
>[] = [
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
    type: "single",
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

const Issue = ({
  certificates,
  certificateIssuees,
  updatePage,
  total,
  totalPages,
  pagination,
  isLoading,
  certificateAlias,
  updateLimit,
  refetch,
}: {
  certificates: TCertificate[];
  certificateIssuees: (CertificateRecipient & { certificate: TCertificate })[];
  total: number;
  totalPages: number;
  pagination: Pagination;
  updatePage: (page: number) => void;
  isLoading: boolean;
  certificateAlias: string;
  updateLimit: (limit: number) => void;
  refetch: () => void;
}) => {
  const router = useRouter();

  const { organization } = useOrganizationStore();

  const { filteredData, filters, selectedFilters, applyFilter, setOptions } =
    useFilter<CertificateRecipient & { certificate: TCertificate }>({
      data: certificateIssuees,
      dataFilters: issueesFilter,
    });

  const {
    searchTerm,
    searchedData: filteredIssuees,
    setSearchTerm,
  } = useSearch<CertificateRecipient & { certificate: TCertificate }>({
    data: filteredData || [],
    accessorKey: [
      "recipientFirstName",
      "recipientLastName",
      "recipientEmail",
      "status",
      "certificate.name",
    ],
  });

  useEffect(() => {
    if (isLoading) return;
    filters
      .filter((filter) => filter.optionsFromData)
      .forEach(({ accessor }) => {
        setOptions(
          accessor,
          extractUniqueTypes<CertificateRecipient>(certificateIssuees, accessor)
        );
      });
    // }, []);
  }, [isLoading]);

  const [selectedOption, setSelectedOption] = useState("manual");

  const [selectedCertificate, setSelectedCertificate] = useState<
    string | undefined
  >(certificateAlias);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  console.log(rowSelection);

  const updateSelectedCertificate = (certificateAlias: string) => {
    setSelectedCertificate(certificateAlias);
    console.log("Selected Certificate:", certificateAlias);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.currentTarget.value);
    console.log("Selected Option:", event.target.value);
    // router.push(`/assign`);
  };

  const selectType = () => {
    if (selectedOption === "manual") {
      router.push(`/designs/certificate/${selectedCertificate}/issue/`);
    } else if (selectedOption === "spreadsheet") {
      router.push(`/assign/certificate/${selectedCertificate}/excel/`);
    } else if (selectedOption === "event") {
      router.push(`/assign/certificate/${selectedCertificate}/fromEvent/`);
    }
  };

  const { mutateData: recallCertificates, isLoading: isLoadingRecall } =
    useMutateData(`/certificates/recipients/recall`);

  const { mutateData: reIssueCertificates, isLoading: isLoadingReissue } =
    useMutateData(`/certificates/recipients/reissue`);

  const { mutateData: resendCertificates, isLoading: isLoadingResend } =
    useMutateData(`/certificates/recipients/resend`);

  const toggleCertificatesFn = async () => {
    const toggleFn = filteredIssuees
      .filter(({ id }) => rowSelection[id])
      .every(({ isValid }) => isValid)
      ? recallCertificates
      : reIssueCertificates;

    await toggleFn({
      payload: {
        ids: filteredIssuees
          .filter(({ id }) => rowSelection[id])
          .map(({ id }) => id),
      },
    });
    updatePage(1);
  };

  const resendCertificatesFn = async () => {
    await resendCertificates({
      payload: {
        recipients: filteredIssuees
          .filter(({ id }) => rowSelection[id])
          .map(({ id, statusDetails }) => ({
            id,
            statusDetails,
          })),
      },
    });
    updatePage(1);
  };

  const exportRecipients = () => {
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
    XLSX.writeFile(
      workbook,
      `credentials_recipients_${
        organization?.organizationName
      }_${new Date().toISOString()}.xlsx`
    );
  };

  const { data: credits, isLoading: creditsIsLoading } = useGetData<
    CredentialsWorkspaceToken[]
  >(`/workspaces/${organization?.id}/credits`, []);

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

  console.log(filteredIssuees);

  const columns = issueesColumns(refetch);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex gap-2 items-center">
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
            onClick={toggleCertificatesFn}
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
              isLoadingReissue
            }
            onClick={exportRecipients}
          >
            <PiExport className="size-4" />
            <span>Export</span>
          </button>
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
              isLoadingReissue
            }
            onClick={resendCertificatesFn}
          >
            <Send className="size-4" />
            <span>Resend</span>
          </button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Link
            href={"/credits/buy"}
            className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit capitalize text-sm"
          >
            Buy more credits
          </Link>
          <Dialog defaultOpen={!!certificateAlias}>
            <DialogTrigger>
              <Button
                disabled={isLoadingRecall || isLoadingReissue}
                className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 w-fit text-sm"
              >
                Assign Credential
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[50%]">
              <DialogHeader>
                <DialogTitle>How would you like to add recipients?</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4">
                <label
                  htmlFor="manual"
                  className={cn(
                    "border-2 hover:border-basePrimary h-[250px] py-4 flex flex-col rounded-md cursor-pointer",
                    selectedOption === "manual" && "border-basePrimary"
                  )}
                >
                  <input
                    type="radio"
                    id="manual"
                    name="options"
                    value="manual"
                    checked={selectedOption === "manual"}
                    onChange={handleChange}
                  />
                  <div className="my-auto flex gap-2 flex-col items-center w-full">
                    <Image
                      src={penPaper}
                      width={40}
                      height={40}
                      alt="excel"
                      className="cursor-pointer"
                    />
                    <span>Add Manually</span>
                  </div>
                </label>
                <label
                  htmlFor="spreadsheet"
                  className={cn(
                    "border-2 hover:border-basePrimary h-[250px] py-4 flex flex-col rounded-md cursor-pointer",
                    selectedOption === "spreadsheet" && "border-basePrimary"
                  )}
                >
                  <input
                    type="radio"
                    id="spreadsheet"
                    name="recipientType"
                    value="spreadsheet"
                    checked={selectedOption === "spreadsheet"}
                    onChange={handleChange}
                  />
                  <div className="my-auto flex gap-2 flex-col items-center w-full">
                    <Image
                      src={excel}
                      width={40}
                      height={40}
                      alt="excel"
                      className="cursor-pointer"
                    />
                    <span className="text-center">
                      Upload using a spreadsheet
                    </span>
                  </div>
                </label>
                <label
                  className={cn(
                    "border-2 hover:border-basePrimary h-[250px] py-4 flex flex-col rounded-md cursor-pointer",
                    selectedOption === "event" && "border-basePrimary"
                  )}
                  htmlFor="event"
                >
                  <input
                    type="radio"
                    id="event"
                    name="recipientType"
                    value="event"
                    checked={selectedOption === "event"}
                    onChange={handleChange}
                  />
                  <div className="my-auto flex gap-2 flex-col items-center w-full">
                    <Image
                      src={logo}
                      width={40}
                      height={40}
                      alt="logo"
                      className="cursor-pointer"
                    />
                    <span>Add from Zikoro event</span>
                  </div>
                </label>
              </div>
              <div className="flex flex-col items-center gap-2 text-xs text-gray-600">
                <span>
                  Assigning certificate costs <b>1 bronze token</b> per
                  recipient
                </span>
                <span>
                  You have <b>{creditBalance.bronze}</b> bronze tokens
                </span>
              </div>
              <GradientBorderSelect
                placeholder="Select Credential"
                value={selectedCertificate || ""}
                onChange={(value: string) => updateSelectedCertificate(value)}
                options={certificates.map(({ certificateAlias, name }) => ({
                  label: name,
                  value: certificateAlias || "",
                }))}
              />

              <DialogFooter>
                {selectedCertificate && (
                  <Button
                    onClick={selectType}
                    className="bg-basePrimary text-white rounded-md"
                  >
                    Add recipients
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex justify-center items-end">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onInput={(event) => setSearchTerm(event.currentTarget.value)}
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
      <DataTable<CertificateRecipient & { certificate: TCertificate }>
        columns={columns}
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
    </section>
  );
};

export default Issue;
