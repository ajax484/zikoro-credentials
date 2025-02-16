import { getRequest, patchRequest, postRequest } from "@/utils/api";
import { useEffect, useState } from "react";
import { deleteRequest } from "@/utils/api";
import { toast } from "../use-toast";

type RequestStatus = {
  isLoading: boolean;
  error: boolean;
};

type UseGetResult<TData> = {
  data: TData;
  getData: () => Promise<TData | undefined>;
} & RequestStatus;

type usePostResult<TData, TReturnData = any> = {
  mutateData: ({
    payload,
  }: {
    payload: TData;
  }) => Promise<TReturnData | undefined>;
} & RequestStatus;

type usePatchResult<TData, TReturnData = any> = {
  updateData: ({
    payload,
  }: {
    payload: TData;
  }) => Promise<TReturnData | undefined>;
} & RequestStatus;

export interface Pagination {
  page: number;
  limit: number;
}

interface PaginationResponse<TData> {
  data: TData;
  total: number;
  totalPages: number;
}

type UseGetPaginatedResult<TData> = {
  data: TData[];
  total: number;
  totalPages: number;
  pagination: Pagination;
  setPagination: React.Dispatch<React.SetStateAction<Pagination>>;
  getData: () => Promise<TData | undefined>;
} & RequestStatus;

export const useGetPaginatedData = <TData>(
  endpoint: string,
  searchParams: URLSearchParams = new URLSearchParams(),
  initialPagination: Pagination = { page: 1, limit: 10 }
): UseGetPaginatedResult<TData> => {
  const [data, setData] = useState<TData[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);

  const getData = async () => {
    setLoading(true);

    try {
      console.log(searchParams);
      const params = new URLSearchParams(searchParams);
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      const { data: responseData, status } = await getRequest<
        PaginationResponse<TData[]>
      >({
        endpoint: `${endpoint}?${params.toString()}`,
      });

      if (status !== 200) {
        throw new Error("Failed to fetch data");
      }

      setData(responseData.data.data);
      setTotal(responseData.data.total);
      setTotalPages(responseData.data.totalPages);
      return responseData.data.data;
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [endpoint, pagination]);

  return {
    data,
    total,
    totalPages,
    pagination,
    setPagination,
    isLoading,
    error,
    getData,
  };
};

export const useGetData = <TData>(
  endpoint: string,
  defaultValue: any = null,
  cancelInitialFetch: boolean = false
): UseGetResult<TData> => {
  const [data, setData] = useState<TData>(defaultValue);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const getData = async () => {
    setLoading(true);

    try {
      const { data: responseData, status } = await getRequest<TData>({
        endpoint,
      });

      if (status !== 200) {
        throw new Error("Failed to fetch data");
      }
      setData(responseData.data);
      console.log(responseData.data);
      return responseData.data;
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("endpoint changed", endpoint);
    if (cancelInitialFetch) return;
    getData();
  }, [endpoint]);

  return {
    data,
    isLoading,
    error,
    getData,
  };
};

export const useMutateData = <TData, TReturnData = any>(
  endpoint: string,
  silent?: boolean
): usePostResult<TData, TReturnData> => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const mutateData = async ({
    payload,
    loadingMessage,
    confirmationMessage,
  }: {
    payload: TData;
    loadingMessage?: string;
    confirmationMessage?: string;
  }) => {
    try {
      setLoading(true);
      !silent &&
        toast({ description: loadingMessage ?? "performing action..." });

      const { data, status } = await postRequest<TReturnData>({
        endpoint,
        payload,
      });

      console.log(status);
      if (status !== 201) {
        throw data;
      }

      !silent &&
        toast({
          description: data.message ?? "action performed successfully",
        });

      return data.data;
    } catch (error) {
      setError(true);
      // console.log(error.response, "here");
      toast({
        description: error.response.data.error,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { isLoading, error, mutateData };
};

export const useUpdateData = <TData, TReturnData = any>(
  endpoint: string,
  silent?: boolean
): usePatchResult<TData, TReturnData> => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const updateData = async ({
    payload,
    loadingMessage,
    confirmationMessage,
  }: {
    payload: TData;
    loadingMessage?: string;
    confirmationMessage?: string;
  }) => {
    try {
      setLoading(true);
      !silent &&
        toast({ description: loadingMessage ?? "performing action..." });

      const { data, status } = await patchRequest<TReturnData>({
        endpoint,
        payload,
      });

      console.log(status);
      if (status !== 201) {
        throw data;
      }

      !silent &&
        toast({
          description: data.message ?? "action performed successfully",
        });

      return data.data;
    } catch (error) {
      setError(true);
      // console.log(error.response, "here");
      toast({
        description: error.response.data.error,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { isLoading, error, updateData };
};

export const usePostRequest = <T>(endpoint: string) => {
  const [isLoading, setLoading] = useState<boolean>(false);

  const postData = async ({ payload }: { payload: T }) => {
    setLoading(true);

    try {
      const { data, status } = await postRequest<T>({
        endpoint: endpoint,
        payload,
      });

      toast({
        description: "Creation Attempt Successful",
      });
      return data;
    } catch (error: any) {
      //
      // toast({
      //   description: error?.response?.data?.error,
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  };

  return { postData, isLoading };
};

export const useDeleteRequest = <T>(endpoint: string) => {
  const [isLoading, setLoading] = useState<boolean>(false);

  const deleteData = async (id = "") => {
    setLoading(true);

    try {
      toast({
        description: "Deleting...",
      });

      console.log(endpoint);

      const { data, status } = await deleteRequest<T>({
        endpoint: `${endpoint}/${id}`,
      });

      console.log(data, "data");

      if (status !== 201) throw data.data;
      toast({
        description: " Delete successful",
      });

      return data.data;
    } catch (error: any) {
      toast({
        description: error?.response?.data?.error,
        variant: "destructive",
      });
      console.log(error, "error");
    } finally {
      setLoading(false);
    }
  };

  return { deleteData, isLoading };
};

type UseFetchResult<TFetchData> = {
  data: TFetchData;
  getData: (param: string) => Promise<TFetchData | undefined>;
} & RequestStatus;

export const useFetchData = <TFetchData>(
  endpoint: string,
  fetchInitial: boolean = true,
  defaultValue: any = null
): UseFetchResult<TFetchData> => {
  const [data, setData] = useState<TFetchData>(defaultValue);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const getData = async (param: string) => {
    setLoading(true);

    try {
      const { data: responseData, status } = await getRequest<TFetchData>({
        endpoint: `${endpoint}/${param}`,
      });

      if (status !== 200) {
        throw new Error("Failed to fetch data");
      }
      setData(responseData.data);

      // console.log(responseData.data);
      return responseData.data;
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    getData,
  };
};
