"use client";
import useUserStore from "@/store/globalUserStore";
import { Directory, DirectoryRecipient } from "@/types/directories";
import { TOrganization } from "@/types/organization";
import { PaginatedData } from "@/types/request";
import { getRequest } from "@/utils/api";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFetchDirectory(organizationAlias: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["directory", organizationAlias],
    queryFn: async () => {
      console.log(organizationAlias);
      const { data, status } = await getRequest<Directory>({
        endpoint: "/workspaces/" + organizationAlias + "/directories",
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
    data: data || null,
    isFetching,
    status,
    error,
    refetch,
  };
}

export function useFetchDirectoryRecipients(
  organizationAlias: string,
  directoryAlias: string,
  pagination: { page: number; limit: number },
  searchTerm: string
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["directory recipients", directoryAlias, pagination, searchTerm],
    queryFn: async () => {
      const { data, status } = await getRequest<
        PaginatedData<DirectoryRecipient>
      >({
        endpoint:
          "/workspaces/" +
          organizationAlias +
          "/directories/" +
          directoryAlias +
          "/recipients" +
          `?limit=${pagination.limit}&page=${pagination.page}&searchTerm=${searchTerm}`,
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

export function useFetchDirectoryRecipient(
  organizationAlias: string,
  directoryAlias: string,
  recipientAlias: string
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["directory recipients", directoryAlias, recipientAlias],
    queryFn: async () => {
      const { data, status } = await getRequest<DirectoryRecipient>({
        endpoint:
          "/workspaces/" +
          organizationAlias +
          "/directories/" +
          directoryAlias +
          "/recipients/" +
          recipientAlias,
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
    data: data || null,
    isFetching,
    status,
    error,
    refetch,
  };
}
