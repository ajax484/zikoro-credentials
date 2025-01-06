import { getRequest } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFetchWorkspaces({
  search,
  role,
  location,
  page,
  limit,
}: {
  search: string;
  role: string;
  location: string;
  page: number;
  limit: number;
}) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["workspaces", search, role, location, page],
    queryFn: async () => {
      const { data } = await getRequest({
        endpoint: "/workspaces",
        searchParams: {
          limit: 10,
          search,
          role,
          location,
          page,
        },
      });

      if (!data.success) {
        toast.error(data.message);
        throw new Error(data.message);
      }

      console.log(data.totalDocs);

      return { users: data.data, totalDocs: data.totalDocs };
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
