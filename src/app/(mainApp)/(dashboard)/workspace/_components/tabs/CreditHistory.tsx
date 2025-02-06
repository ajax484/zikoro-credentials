import { DataTable } from "@/components/DataTable/data-table";
import { useGetData, useGetPaginatedData } from "@/hooks/services/request";
import useOrganizationStore from "@/store/globalOrganizationStore";
import React, { useEffect } from "react";
import { creditHistoryColumns } from "./CreditHistoryColumns";
import { CredentialTokenUsageHistory } from "@/types/token";
import CreditHistoryIcon from "@/public/icons/ph_coins-duotone.svg";
import { TFilter } from "@/types/filter";
import { useFilter } from "@/hooks";
import { extractUniqueTypes } from "@/utils/helpers";
import GradientBorderSelect from "@/components/CustomSelect/GradientSelectBorder";
import Filter from "@/components/Filter";

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
