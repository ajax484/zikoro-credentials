"use client";
import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/organization";
import { getRequest } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFetchWorkspaces(userEmail: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["workspaces", userEmail],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("userEmail", userEmail);

      const { data, status } = await getRequest<TOrganization[]>({
        endpoint: "/workspaces",
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
