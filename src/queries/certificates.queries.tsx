"use client";
import {
  CertificateRecipient,
  CertificateTemplate,
  FailedCertificateRecipient,
  TCertificate,
} from "@/types/certificates";
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

export function useFetchWorkspaceCertificates(
  workspaceAlias: string,
  pagination: { page: number; limit: number | null },
  searchTerm: string
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["certificates", workspaceAlias, pagination, searchTerm],
    queryFn: async () => {
      const { data, status } = await getRequest<PaginatedData<TCertificate>>({
        endpoint: `/workspaces/${workspaceAlias}/certificates?limit=${pagination.limit}&page=${pagination.page}&searchTerm=${searchTerm}`,
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

export function useFetchWorkspaceCertificatesRecipients(
  workspaceAlias: string,
  pagination: { page: number; limit: number | null },
  searchTerm: string
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["workspace recipients", workspaceAlias, pagination, searchTerm],
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

export function useFetchCertificateRecipients(
  certificateAlias: string,
  pagination: { page: number; limit: number },
  searchTerm: string
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: [
      "certificates recipients",
      certificateAlias,
      pagination,
      searchTerm,
    ],
    queryFn: async () => {
      const { data, status } = await getRequest<
        PaginatedData<CertificateRecipient>
      >({
        endpoint: `/certificates/recipients?certificateAlias=${certificateAlias}&limit=${pagination.limit}&page=${pagination.page}&searchTerm=${searchTerm}`,
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

export function useFetchFailedWorkspaceCertificatesRecipients(
  workspaceAlias: string,
  pagination: { page: number; limit: number },
  searchTerm: string
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: [
      "failed certificates recipients",
      workspaceAlias,
      pagination,
      searchTerm,
    ],
    queryFn: async () => {
      const { data, status } = await getRequest<
        PaginatedData<FailedCertificateRecipient>
      >({
        endpoint: `/certificates/recipients/failed?workspaceAlias=${workspaceAlias}&limit=${pagination.limit}&page=${pagination.page}&searchTerm=${searchTerm}`,
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

export function useFetchFailedCertificateRecipients(
  certificateAlias: string,
  pagination: { page: number; limit: number },
  searchTerm: string
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: [
      "failed certificates recipients",
      certificateAlias,
      pagination,
      searchTerm,
    ],
    queryFn: async () => {
      const { data, status } = await getRequest<
        PaginatedData<FailedCertificateRecipient>
      >({
        endpoint: `/certificates/recipients/failed?certificateAlias=${certificateAlias}&limit=${pagination.limit}&page=${pagination.page}&searchTerm=${searchTerm}`,
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

export function useFetchCertificateTemplates() {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["certificate templates"],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      const { data, status } = await getRequest<CertificateTemplate[]>({
        endpoint: "/certificates/templates",
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

export function useFetchRecipientCertificates(
  organizationAlias: string,
  directoryAlias: string,
  recipientAlias: string,
  pagination: { page: number; limit: number },
  searchTerm: string
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: [
      "certificates recipients",
      recipientAlias,
      pagination,
      searchTerm,
    ],
    queryFn: async () => {
      const { data, status } = await getRequest<
        PaginatedData<CertificateRecipient & { certificate: TCertificate }>
      >({
        endpoint: `/workspaces/${organizationAlias}/directories/${directoryAlias}/recipients/${recipientAlias}/credentials?limit=${pagination.limit}&page=${pagination.page}&searchTerm=${searchTerm}`,
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
