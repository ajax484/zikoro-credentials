"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRequest, postRequest } from "@/utils/api";
import { toast } from "react-toastify";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { PaginatedData } from "@/types/request";

export function useCreateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<TCertificate>) => {
      const { data, status } = await postRequest<TCertificate>({
        endpoint: `/certificates`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data.error!);
      }

      return data.data;
    },
    onMutate: ({ name }) => {
      // Show loading toast
      return toast.loading(`creating ${name} ...`);
    },
    onSuccess: (certificate, _, toastId) => {
      console.log(certificate);
      // Update workspace in any query where it exists
      queryClient.setQueriesData<
        PaginatedData<TCertificate> | TCertificate[] | TCertificate
      >(
        {
          predicate: (query) => query.queryKey.includes("certificates"),
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          if (Array.isArray(oldData)) {
            return [certificate, ...oldData];
          } else if ("data" in oldData) {
            return {
              ...oldData,
              data: [certificate, ...oldData.data],
            };
          } else {
            return certificate;
          }
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: `${certificate.name} created successful!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return certificate;
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toastId &&
        toast.update(toastId, {
          render: "Failed to create certificate. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
    },
  });
}

export function useDeleteCertificate(certificateAlias: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { status } = await deleteRequest<{ certificateId: string }>({
        endpoint: `/certificates/${certificateAlias}`,
      });

      if (status !== 201) {
        throw new Error();
      }

      return certificateAlias;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("deleting certificate...");
    },
    onSuccess: (integrationAlias, _, toastId) => {
      console.log(integrationAlias);
      queryClient.setQueriesData<
        TCertificate | PaginatedData<TCertificate> | TCertificate[]
      >(
        {
          predicate: (query) =>
            query.queryKey.includes("certificates") ||
            query.queryKey.includes(certificateAlias),
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          if (Array.isArray(oldData)) {
            return oldData.filter(
              (item) => item.certificateAlias !== certificateAlias
            );
          } else if ("data" in oldData) {
            return {
              ...oldData,
              data: oldData.data.filter(
                (item) => item.certificateAlias !== certificateAlias
              ),
            };
          }
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "certificate deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toastId &&
        toast.update(toastId, {
          render: "Failed to delete certificate. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
    },
  });
}

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

export function useIssueCertificates(certificateAlias: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, status } = await postRequest<CertificateRecipient[]>({
        endpoint: `/certificates/${certificateAlias}/recipients/release`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("Issuing certificates...");
    },
    onSuccess: (updatedRecipients, _, toastId) => {
      // Update workspace in any query where it exists
      queryClient.setQueriesData<
        PaginatedData<CertificateRecipient> | CertificateRecipient[]
      >(
        {
          predicate: (query) =>
            query.queryKey.includes("certificates recipients") &&
            query.queryKey.includes(certificateAlias),
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(updatedRecipients);
          console.log(oldData);

          if (Array.isArray(oldData)) {
            return [
              ...oldData.filter(
                ({ id }) =>
                  !updatedRecipients.find(
                    ({ id: updatedId }) => updatedId === id
                  )
              ),
              ...updatedRecipients,
            ];
          } else if ("data" in oldData) {
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
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Issue successful!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toast.update(toastId, {
        render: "Failed to issue certificates. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
}
