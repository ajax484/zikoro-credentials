"use client";
import { TCertificate } from "@/types/certificates";
import { getRequest } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFetchCertificates(workspaceAlias: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["certificates", workspaceAlias],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("workspaceAlias", workspaceAlias);

      const { data, status } = await getRequest<TCertificate[]>({
        endpoint: "/certificates",
        searchParams,
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

export function useFetchRecentCertificate(workspaceAlias: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["recentCertificate", workspaceAlias],
    queryFn: async () => {
      const { data, status } = await getRequest<TCertificate>({
        endpoint: `/workspaces/${workspaceAlias}/certificates/recent`,
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
    data,
    isFetching,
    status,
    error,
    refetch,
  };
}
