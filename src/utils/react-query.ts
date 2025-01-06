"use client";
import { getRequest } from "@/utils/api";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useInfiniteFetch<TData, TSearchParams>({
  endpoint,
  search,
  role,
  location,
  page,
  limit,
  searchParams,
}: {
  endpoint: string;
  search: string;
  role: string;
  location: string;
  page: number;
  limit: number;
  searchParams?: TSearchParams;
}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<
    TData,
    Error,
    InfiniteData<TData, string | null>,
    QueryKey,
    string | null
  >({
    queryKey: ["users"],
    queryFn: ({ pageParam = null }) =>
      getRequest({
        endpoint,
        searchParams: {
          ...searchParams,
          limit: limit,
          search,
          role,
          location,
          page: pageParam,
        },
      }),
    getNextPageParam: (lastPage) => lastPage?.nextCursor || null,
    initialPageParam: null,
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
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
