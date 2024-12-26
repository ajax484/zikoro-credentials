"use client";
import { useGetData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import Issue from "./Issue";

const CertificateInfoPage = ({ alias }: { alias: string }) => {
  const { data: certificate, isLoading } = useGetData<TCertificate>(
    "/certificates/" + alias,
    true
  );

  const [page, setPage] = useState<number>(1);

  const updatePage = (page: number) => {
    setPage(page);
  };

  const { data: certificateIssuees, isLoading: certificateIssueesIsLoading } =
    useGetData<CertificateRecipient[]>(
      `/certificate/${alias}/recipients?page=${page}`,
      true,
      []
    );

  return (
    <section>
      <Tabs defaultValue="issue" className="w-full">
        <TabsList className="flex mx-auto w-2/5 border my-6">
          <TabsTrigger
            className="w-full data-[state=active]:bg-blue-700 group data-[state=active]:text-white"
            value="issue"
            disabled={isLoading}
          >
            Issue
          </TabsTrigger>
          <TabsTrigger
            className="w-full data-[state=active]:bg-blue-700 data-[state=active]:text-white"
            value="analytics"
            disabled={isLoading}
          >
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="issue">
          {isLoading && certificateIssueesIsLoading ? (
            <div>Loading...</div>
          ) : (
            <Issue
              certificate={certificate}
              certificateIssuees={certificateIssuees}
              updatePage={updatePage}
              page={page}
            />
          )}
        </TabsContent>
        <TabsContent value="analytics"></TabsContent>
      </Tabs>
    </section>
  );
};

export default CertificateInfoPage;
