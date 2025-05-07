"use client";
import React, { useState } from "react";
import Issue from "./Issue";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  useFetchCertificateRecipients,
  useFetchCertificates,
  useFetchFailedCertificateRecipients,
} from "@/queries/certificates.queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Failed from "./Failed";

const RecipientsPage = ({ certificateAlias }: { certificateAlias: string }) => {
  const { organization } = useOrganizationStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<{ page: number; limit: number }>(
    { page: 1, limit: 10 }
  );

  const { data: certificates, isFetching: certificatesIsLoading } =
    useFetchCertificates(organization?.organizationAlias!);

  const searchParams = new URLSearchParams({
    workspaceAlias: organization?.organizationAlias || "",
  });

  const { data, isFetching: certificateIssueesIsLoading } =
    useFetchCertificateRecipients(
      organization?.organizationAlias!,
      pagination,
      searchTerm
    );

  const { data: failedData, isFetching: failedCertificateIssueesIsLoading } =
    useFetchFailedCertificateRecipients(
      organization?.organizationAlias!,
      pagination,
      searchTerm
    );

  const updatePage = (page: number) => {
    setPagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setPagination({ page: 1, limit });
  };

  console.log(data);

  return (
    <section>
      <Tabs
        onChange={() => {
          setPagination({ page: 1, limit: 10 });
          setSearchTerm("");
        }}
        defaultValue="issued"
        className="w-full !p-0"
      >
        <TabsList className="flex mx-auto w-2/5 border my-6">
          <TabsTrigger
            key={"issued"}
            value={"issued"}
            className="w-full data-[state=active]:bg-blue-700 group data-[state=active]:text-white flex gap-2"
          >
            <span>Issued</span>
            <span className="rounded-full text-xs items-center justify-center group-data-[state=active]:bg-white group-data-[state=active]:text-blue-700 px-2 py-1 bg-gray-300 text-gray-600">
              {data.data?.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            key={"failed"}
            value={"failed"}
            className="w-full data-[state=active]:bg-blue-700 group data-[state=active]:text-white flex gap-2"
          >
            <span>Failed</span>
            <span className="rounded-full text-xs items-center justify-center group-data-[state=active]:bg-white group-data-[state=active]:text-blue-700 px-2 py-1 bg-gray-300 text-gray-600">
              {failedData?.data?.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent key={"issued"} value={"issued"} className="p-4">
          <Issue
            certificateAlias={certificateAlias}
            certificates={certificates}
            certificateIssuees={data?.data}
            updatePage={updatePage}
            updateLimit={updateLimit}
            total={data?.total}
            totalPages={data?.totalPages}
            pagination={pagination}
            isLoading={certificateIssueesIsLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </TabsContent>
        <TabsContent key={"failed"} value={"failed"} className="p-4">
          <Failed
            certificateAlias={certificateAlias}
            certificates={certificates}
            certificateIssuees={failedData?.data}
            updatePage={updatePage}
            updateLimit={updateLimit}
            total={failedData?.total}
            totalPages={failedData?.totalPages}
            pagination={pagination}
            isLoading={failedCertificateIssueesIsLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default RecipientsPage;
