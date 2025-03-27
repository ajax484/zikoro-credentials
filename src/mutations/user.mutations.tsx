"use client";
import {
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { patchRequest, postRequest } from "@/utils/api";
import { toast } from "react-toastify";
import { CredentialsWorkspaceToken } from "@/types/token";
import { TUser } from "@/types/user";
import useUserStore from "@/store/globalUserStore";
import { UpdateData } from "@/types/request";

export function useUpdateUser(userId: number) {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: async (payload: Partial<TUser>) => {
      const { data, status } = await patchRequest<TUser>({
        endpoint: `/users/${userId}`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("updating user...");
    },
    onSuccess: (user, _, toastId) => {
      // Update workspace in any query where it exists
      console.log(user);
      setUser(user);

      // Update toast to success
      toast.update(toastId, {
        render: "update successful!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toast.update(toastId, {
        render: "Failed to update workspace. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
}
