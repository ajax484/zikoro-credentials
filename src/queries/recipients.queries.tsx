"use client";
import { CertificateRecipient } from "@/types/certificates";
import { CredentialsWorkspaceToken } from "@/types/token";
import { getRequest } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFetchRecipients(workspaceAlias: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["recipients", workspaceAlias],
    queryFn: async () => {
      const { data, status } = await getRequest<CertificateRecipient[]>({
        endpoint: `/workspaces/${workspaceAlias}/certificates/recipients`,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log(data.data);

      return data.data;
    },
  });

  return {
    data: data || [],
    isFetching,
    status,
    error,
    refetch,
  };
}
