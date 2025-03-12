"use client";
import React, { useState } from "react";
import GradientText from "@/components/GradientText";
import CustomLink from "@/components/CustomLink/CustomLink";
import { useFetchIntegrations } from "@/queries/integrations.queries";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { DataTable } from "@/components/DataTable/data-table";
import { columns } from "./columns";
import { RowSelectionState } from "@tanstack/react-table";

const Integrations = () => {
  const { organization } = useOrganizationStore();
  const [pagination, setPagination] = useState<{ page: number; limit: number }>(
    { page: 1, limit: 10 }
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const {
    data,
    isFetching: integrationsIsLoading,
    refetch: refetchIntegrations,
    error: integrationsError,
  } = useFetchIntegrations(organization?.organizationAlias!, pagination);

  const updatePage = (page: number) => {
    setPagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setPagination({ page: 1, limit });
  };

  console.log(data);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Credential Integration
      </h1>
      <section className="bg-white border rounded-md p-4 min-h-[500px]">
        {integrationsIsLoading ? (
          <div>Loading...</div>
        ) : data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 h-[500px] w-full">
            <GradientText className="font-bold text-2xl" Tag={"h1"}>
              No Integrations Yet
            </GradientText>
            <p className="text-gray-800 text-sm font-medium w-1/2 text-center">
              Automate Credential Issuance by integrating with{" "}
              <b>Zikoro Forms</b>, <b>Zikoro Quiz</b> or <b>Zikoro Events</b>.
              Seamlessly connect and streamline your workflow.
            </p>
            <CustomLink href="/integrations/connect">
              Add Integration
            </CustomLink>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Your Integrations
              </h1>
              <CustomLink href="/integrations/connect">
                Add Integration
              </CustomLink>
            </div>
            <DataTable
              columns={columns}
              data={data?.data}
              currentPage={pagination.page}
              setCurrentPage={updatePage}
              limit={pagination.limit}
              refetch={() => {}}
              totalDocs={data?.total}
              isFetching={integrationsIsLoading}
              onClick={() => {}}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
          </div>
        )}
      </section>
    </section>
  );
};

export default Integrations;
