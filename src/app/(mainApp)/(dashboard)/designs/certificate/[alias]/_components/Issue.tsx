import { DataTable } from "@/components/DataTable/data-table";
import Filter from "@/components/Filter";
import { Button } from "@/components/ui/button";
import { useFilter } from "@/hooks";
import useSearch from "@/hooks/common/useSearch";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { TFilter } from "@/types/filter";
import { extractUniqueTypes } from "@/utils/helpers";
import { PenLine, Send, Trash } from "lucide-react";
import React, { useEffect } from "react";
import { PiExport } from "react-icons/pi";
import { issueesColumns } from "./columns";
import Link from "next/link";

const issueesFilter: TFilter<CertificateRecipient>[] = [
  {
    label: "Issue Date",
    type: "dateRange",
    order: 1,
    icon: (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth={0}
        viewBox="0 0 1024 1024"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M712 304c0 4.4-3.6 8-8 8h-56c-4.4 0-8-3.6-8-8v-48H384v48c0 4.4-3.6 8-8 8h-56c-4.4 0-8-3.6-8-8v-48H184v136h656V256H712v48z" />
        <path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zm0-448H184V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136z" />
      </svg>
    ),
    accessor: "dateIssued",
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
  },
];

const Issue = ({
  certificate,
  certificateIssuees,
  updatePage,
  page,
}: {
  certificate: TCertificate;
  certificateIssuees: CertificateRecipient[];
  updatePage: (page: number) => void;
  page: number;
}) => {
  console.log(certificate);
  if (!certificate) return null;

  const { filteredData, filters, selectedFilters, applyFilter, setOptions } =
    useFilter<CertificateRecipient>({
      data: certificateIssuees,
      dataFilters: issueesFilter,
    });

  const {
    searchTerm,
    searchedData: filteredIssuees,
    setSearchTerm,
  } = useSearch<CertificateRecipient>({
    data: filteredData || [],
    accessorKey: ["recipientName", "recipientEmail"],
  });

  useEffect(() => {
    // if (isLoading) return;
    filters
      .filter((filter) => filter.optionsFromData)
      .forEach(({ accessor }) => {
        setOptions(
          accessor,
          extractUniqueTypes<CertificateRecipient>(certificateIssuees, accessor)
        );
      });
  }, []);

  //   }, [isLoading]);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex gap-4 items-end leading-none">
          <h1 className="text-3xl font-semibold text-gray-800">
            {certificate.name}
          </h1>
          <PenLine className="size-5" />
        </div>
        <Link
          className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 w-fit text-sm"
          href={`/designs/certificate/${certificate.certificateAlias}/issue`}
        >
          Issue
        </Link>
      </div>
      <div className="flex items-end justify-between">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onInput={(event) => setSearchTerm(event.currentTarget.value)}
          className="placeholder:text-sm placeholder:text-gray-400 text-gray-700 bg-transparent px-4 py-2 w-1/3 border-b focus-visible:outline-none"
        />
        <div className="flex gap-2 items-center">
          <button className="border-red-600 border rounded-xl text-red-600 flex items-center gap-2 bg-white px-4 py-2 text-sm">
            <Trash className="size-4" />
            <span>Recall</span>
          </button>
          <button className="border-basePrimary border rounded-xl text-basePrimary flex items-center gap-2 bg-white px-4 py-2 text-sm">
            <PiExport className="size-4" />
            <span>Export</span>
          </button>
          <button className="border-basePrimary border rounded-xl text-basePrimary flex items-center gap-2 bg-white px-4 py-2 text-sm">
            <Send className="size-4" />
            <span>Resend</span>
          </button>
        </div>
      </div>
      <Filter
        className={`space-y-4 w-1/3 mx-auto hide-scrollbar`}
        filters={filters.sort(
          (a, b) => (a.order || Infinity) - (b.order || Infinity)
        )}
        applyFilter={applyFilter}
        selectedFilters={selectedFilters}
      />
      <DataTable<CertificateRecipient>
        columns={issueesColumns}
        data={filteredIssuees}
        currentPage={page}
        setCurrentPage={updatePage}
        limit={10}
        refetch={() => {}}
        totalDocs={1}
        isFetching={false}
        onClick={() => {}}
      />
    </section>
  );
};

export default Issue;
