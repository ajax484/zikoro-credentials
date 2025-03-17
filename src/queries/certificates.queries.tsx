"use client";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { PaginatedData } from "@/types/request";
import { getRequest } from "@/utils/api";
import {
  InfiniteData,
  keepPreviousData,
  QueryKey,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
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

export function useFetchCertificateRecipients(
  workspaceAlias: string,
  pagination: { page: number; limit: number },
  searchTerm: string
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["certificates recipients", workspaceAlias, pagination],
    queryFn: async () => {
      const { data, status } = await getRequest<
        PaginatedData<CertificateRecipient>
      >({
        endpoint: `/certificates/recipients?workspaceAlias=${workspaceAlias}&limit=${pagination.limit}&page=${pagination.page}&searchTerm=${searchTerm}`,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log(data.data);

      return data.data;
    },
    placeholderData: keepPreviousData,
  });

  return {
    data: data || {
      data: [],
      limit: pagination.limit,
      total: 0,
      totalPages: 0,
      page: pagination.page,
    },
    isFetching,
    status,
    error,
    refetch,
  };
}
