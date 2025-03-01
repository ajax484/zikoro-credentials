"use client";
import { CredentialsWorkspaceToken } from "@/types/token";
import { getRequest } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFetchWorkspaceCredits(id: number) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["workspaceCredits", id],
    queryFn: async () => {
      const { data, status } = await getRequest<CredentialsWorkspaceToken[]>({
        endpoint: `/workspaces/${id}/credits`,
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
