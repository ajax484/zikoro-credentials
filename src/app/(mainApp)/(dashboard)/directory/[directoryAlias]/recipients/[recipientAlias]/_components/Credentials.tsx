import Filter from "@/components/Filter";
import Pagination from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilter } from "@/hooks";
import useSearch from "@/hooks/common/useSearch";
import { useFetchRecipientCertificates } from "@/queries/certificates.queries";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { DirectoryRecipient } from "@/types/directories";
import { TFilter } from "@/types/filter";
import { extractUniqueTypes } from "@/utils/helpers";
import { Calendar } from "@phosphor-icons/react";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const credentialsFilter: TFilter<CertificateRecipient>[] = [
  {
    label: "Issue Date",
    accessor: "created_at",
    // icon: <Calendar />,
    type: "dateSingle",
    order: 1,
  },
];

const Credentials = ({ recipient }: { recipient: DirectoryRecipient }) => {
  const params = useParams();
  const { organization } = useOrganizationStore();
  const { directoryAlias } = params;
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

  // Ensure directoryAlias is a string
  const safeDirectoryAlias =
    typeof directoryAlias === "string"
      ? directoryAlias
      : directoryAlias?.[0] ?? "";

  const {
    data: credentials,
    isFetching: credentialsIsLoading,
    refetch,
  } = useFetchRecipientCertificates(
    organization?.organizationAlias!,
    safeDirectoryAlias,
    recipient?.recipientAlias!,
    pagination,
    searchTerm
  );

  console.log(credentials.data);

  // useEffect(() => {
  //   if (credentialsIsLoading) return;
  //   filters
  //     .filter((filter) => filter.optionsFromData)
  //     .forEach(({ accessor }) => {
  //       setOptions(
  //         accessor,
  //         extractUniqueTypes<CertificateRecipient>(credentials.data, accessor)
  //       );
  //     });
  // }, [credentialsIsLoading]);

  type CredentialProps = {
    credential: CertificateRecipient & { certificate: TCertificate };
  };

  const Credential = ({ credential }: CredentialProps) => {
    return (
      <div className="rounded-md border bg-white">
        <div className="p-2 border-b">
          <div className="flex justify-between mb-1">
            <Link href={`/assign/admin/view/${credential.certificateId}`}>
              <h2 className="font-semibold capitalize hover:underline">
                {credential.certificate.name}
              </h2>
            </Link>
            <div className="rounded-xl text-white bg-gray-700 px-2 py-1 text-xs h-fit">
              {credential.certificate.certificateSettings.cpdPoints || 0} Points
            </div>
          </div>

          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-zikoroGray font-semibold">
              Credential Id: {credential.certificateId}
            </span>
            <span className="text-xs text-zikoroGray font-semibold">
              Group Id: {credential.certificate.certificateAlias}
            </span>
          </div>

          <div className="space-y-1 mb-1">
            <h3 className="font-semibold text-zikoroBlack text-xs">SKILLS</h3>
            <div className="flex gap-2 flex-wrap">
              {credential.certificate.certificateSettings.skills.length > 0 ? (
                <>
                  {credential.certificate.certificateSettings.skills.map(
                    (skill, index) => (
                      <div
                        key={index}
                        className="rounded-xl text-zikoroBlack px-2 py-1 text-xs"
                        style={{
                          backgroundColor: skill.color + "22",
                          color: skill.color,
                          borderWidth: "2px",
                          borderColor: skill.color + "22",
                        }}
                      >
                        {skill.value}
                      </div>
                    )
                  )}
                </>
              ) : (
                <div className="text-sm text-zikoroGray">
                  <span>No skills added</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-1 p-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-zikoroGray">Certified on:</span>
            <span>
              {format(new Date(credential.created_at), "dd MMM, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zikoroGray">Expires on:</span>
            <span>
              {credential.certificate.certificateSettings.expiryDate
                ? format(
                    new Date(
                      credential.certificate.certificateSettings.expiryDate
                    ),
                    "dd MMM, yyyy"
                  )
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CredentialLoading = () => {
    return (
      <div className="rounded-md border bg-white">
        <div className="p-1 border-b">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="w-1/2 h-7 rounded-lg" />
            <Skeleton className="w-16 h-5 rounded-xl" />
          </div>
          <div className="space-y-1 mb-1">
            <h3 className="font-semibold text-zikoroBlack text-xs">SKILLS</h3>
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="w-10 h-7 rounded-lg" />
              <Skeleton className="w-10 h-7 rounded-lg" />
              <Skeleton className="w-10 h-7 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-1 p-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-zikoroGray">Certified on:</span>
            <Skeleton className="w-20 h-4 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zikoroGray">Expires on:</span>
            <Skeleton className="w-20 h-4 rounded" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4 flex-1">
      <div className="w-1/2 mx-auto">
        <Input
          placeholder="Search credential"
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          value={searchTerm}
          className="border-none !border-b"
        />
        {/* <Filter
          className={`space-y-4 w-1/2 mx-auto hide-scrollbar`}
          filters={filters.sort(
            (a, b) => (a.order || Infinity) - (b.order || Infinity)
          )}
          applyFilter={applyFilter}
          selectedFilters={selectedFilters}
          type="dropdown"
        /> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentialsIsLoading ? (
          <>
            <CredentialLoading />
            <CredentialLoading />
            <CredentialLoading />
          </>
        ) : (
          credentials.data.map((credential, index) => (
            <Credential key={index} credential={credential} />
          ))
        )}
      </div>
      <Pagination
        totalDocs={credentials.total}
        currentPage={credentials.page}
        setCurrentPage={updatePage}
        limit={credentials.limit}
      />
    </section>
  );
};

export default Credentials;
