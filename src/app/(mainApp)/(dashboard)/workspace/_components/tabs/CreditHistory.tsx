import { DataTable } from "@/components/DataTable/data-table";
import { useGetData, useGetPaginatedData } from "@/hooks/services/request";
import useOrganizationStore from "@/store/globalOrganizationStore";
import React, { useEffect } from "react";
import { creditHistoryColumns } from "./CreditHistoryColumns";
import {
  CredentialsWorkspaceToken,
  CredentialTokenUsageHistory,
} from "@/types/token";
import CreditHistoryIcon from "@/public/icons/ph_coins-duotone.svg";
import { TFilter } from "@/types/filter";
import { useFilter } from "@/hooks";
import { extractUniqueTypes } from "@/utils/helpers";
import GradientBorderSelect from "@/components/CustomSelect/GradientSelectBorder";
import Filter from "@/components/Filter";
import Link from "next/link";

const creditHistoryFilter: TFilter<CredentialTokenUsageHistory>[] = [
  {
    label: "Transaction Date",
    accessor: "created_at",
    type: "dateSingle",
    order: 1,
  },
  {
    accessor: "activity",
    label: "Transaction Type",
    type: "multiple",
    order: 2,
    optionsFromData: true,
  },
];

const CreditHistory = () => {
  const { organization } = useOrganizationStore();

  const {
    data: creditHistory,
    isLoading: creditHistoryLoading,
    total,
    pagination,
    setPagination,
    getData: refetchCreditHistory,
  } = useGetPaginatedData<CredentialTokenUsageHistory>(
    `/workspaces/${organization?.organizationAlias}/credits/history`
  );

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

  const { filteredData, filters, selectedFilters, applyFilter, setOptions } =
    useFilter<CredentialTokenUsageHistory>({
      data: creditHistory,
      dataFilters: creditHistoryFilter,
    });

  useEffect(() => {
    if (creditHistoryLoading) return;
    filters
      .filter((filter) => filter.optionsFromData)
      .forEach(({ accessor }) => {
        setOptions(
          accessor,
          extractUniqueTypes<CredentialTokenUsageHistory>(
            creditHistory,
            accessor
          )
        );
      });
  }, [creditHistoryLoading]);

  console.log(creditHistory);

  const updatePage = (page: number) => {
    setPagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setPagination({ page: 1, limit });
  };

  return (
    <div className="space-y-6">
      <div className="bg-basePrimary/10 text-[#1F1F1F] px-1 py-4 rounded-xl space-y-2 border md:w-1/2 mx-auto my-6">
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
        <p className="text-center font-medium text-gray-800 text-sm">
          You need credits to issue credentials.
        </p>
        <Link
          href={"/credits/buy"}
          className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit capitalize text-xs"
        >
          Buy more credits
        </Link>
      </div>
      <h2 className="text-sm font-medium text-gray-600 text-center">
        Your workspace credit history
      </h2>
      <div className="flex justify-end gap-2 items-end">
        <Filter
          className={`space-y-4 w-fit mx-auto hide-scrollbar`}
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
      <DataTable<CredentialTokenUsageHistory>
        columns={creditHistoryColumns}
        data={filteredData}
        isFetching={creditHistoryLoading}
        refetch={refetchCreditHistory}
        totalDocs={total}
        rowSelection={{}}
        setRowSelection={() => {}}
        currentPage={pagination.page}
        setCurrentPage={updatePage}
        limit={pagination.limit}
      />
    </div>
  );
};

export default CreditHistory;
