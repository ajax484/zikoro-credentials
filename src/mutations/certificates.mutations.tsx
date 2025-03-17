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
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { PaginatedData } from "@/types/request";

export function useRecallCertificates(workspaceAlias: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, status } = await postRequest<CertificateRecipient[]>({
        endpoint: `/certificates/recipients/recall`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("recalling certificates...");
    },
    onSuccess: (updatedRecipients, _, toastId) => {
      console.log(updatedRecipients);
      // Update workspace in any query where it exists
      queryClient.setQueriesData<PaginatedData<CertificateRecipient>>(
        {
          queryKey: ["certificates recipients", workspaceAlias],
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          return {
            ...oldData,
            data: [
              ...oldData.data.filter(
                ({ id }) =>
                  !updatedRecipients.find(
                    ({ id: updatedId }) => updatedId === id
                  )
              ),
              ...updatedRecipients,
            ],
          };
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Recall successful!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toast.update(toastId, {
        render: "Failed to recall certificates. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
}

export function useReIssueCertificates(workspaceAlias: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, status } = await postRequest<CertificateRecipient[]>({
        endpoint: `/certificates/recipients/reissue`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("reissuing certificates...");
    },
    onSuccess: (updatedRecipients, _, toastId) => {
      // Update workspace in any query where it exists
      queryClient.setQueriesData<PaginatedData<CertificateRecipient>>(
        {
          queryKey: ["certificates recipients", workspaceAlias],
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(updatedRecipients);
          console.log(oldData);

          return {
            ...oldData,
            data: [
              ...oldData.data.filter(
                ({ id }) =>
                  !updatedRecipients.find(
                    ({ id: updatedId }) => updatedId === id
                  )
              ),
              ...updatedRecipients,
            ],
          };
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Reissue successful!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toast.update(toastId, {
        render: "Failed to reissue certificates. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
}

export function useResendCertificates(workspaceAlias: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, status } = await postRequest<CertificateRecipient[]>({
        endpoint: `/certificates/recipients/resend`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("resending certificates...");
    },
    onSuccess: (updatedRecipients, _, toastId) => {
      console.log(updatedRecipients);
      // Update workspace in any query where it exists
      queryClient.setQueriesData<PaginatedData<CertificateRecipient>>(
        {
          queryKey: ["certificates recipients", workspaceAlias],
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          return {
            ...oldData,
            data: [
              ...oldData.data.filter(
                ({ id }) =>
                  !updatedRecipients.find(
                    ({ id: updatedId }) => updatedId === id
                  )
              ),
              ...updatedRecipients,
            ],
          };
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Resend successful!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toast.update(toastId, {
        render: "Failed to resend certificates. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
}
