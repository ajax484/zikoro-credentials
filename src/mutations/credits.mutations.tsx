"use client";
import {
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { TOrganization } from "@/types/organization";
import { patchRequest, postRequest } from "@/utils/api";
import { toast } from "react-toastify";
import { CredentialsWorkspaceToken } from "@/types/token";

export function useUpdateWorkspaceCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, status } = await patchRequest<CredentialsWorkspaceToken>({
        endpoint: `/workspaces/credits/buy`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("buying credits...");
    },
    onSuccess: (updatedCreditInfo, _, toastId) => {
      // Update workspace in any query where it exists
      queryClient.setQueriesData<CredentialsWorkspaceToken[]>(
        {
          queryKey: ["workspaceCredits", workspaceId],
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          return oldData.map((credit) => {
            if (credit.id === updatedCreditInfo.id) {
              return updatedCreditInfo;
            } else {
              return credit;
            }
          });
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Transaction successful!",
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
