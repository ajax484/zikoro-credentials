"use client";
import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/organization";
import { getRequest } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFetchWorkspaces() {
  const { user } = useUserStore();
  
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["workspaces", user.userEmail],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("userEmail", user.userEmail);

      const { data, status } = await getRequest<TOrganization[]>({
        endpoint: "/workspaces",
        searchParams,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      return data.data;
    },
    initialData: [],
  });

  return {
    data,
    isFetching,
    status,
    error,
    refetch,
  };
}

export function useFetchUser({ id }: { id: string }) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data } = await getRequest({
        endpoint: `/admin/users/${id}`,
      });

      if (!data.success) {
        toast.error(data.message);
        throw new Error(data.message);
      }

      console.log(data.data);

      return data.data.user as Users;
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
