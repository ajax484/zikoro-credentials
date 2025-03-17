"use client";
import {
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { OrganizationVerification, TOrganization } from "@/types/organization";
import { deleteRequest, patchRequest, postRequest } from "@/utils/api";
import { toast } from "react-toastify";
import useOrganizationStore from "@/store/globalOrganizationStore";
import useUserStore from "@/store/globalUserStore";
import { useRouter } from "next/navigation";
import { CredentialsIntegration } from "@/types/integrations";
import { PaginatedData } from "@/types/request";

export function useCreateIntegration(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<CredentialsIntegration>) => {
      const { data, status } = await postRequest<CredentialsIntegration>({
        endpoint: `/workspaces/${workspaceId}/integrations`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("Creating integration...");
    },
    onSuccess: (newIntegration, _, toastId) => {
      // Update integration in any query where it exists
      queryClient.setQueriesData<PaginatedData<CredentialsIntegration>[]>(
        {
          predicate: (query) => query.queryKey.includes("integrations"),
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          return { ...oldData, data: [...oldData.data, newIntegration] };
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "integration created successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toast.update(toastId, {
        render: "Failed to create integration. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
}

export function useUpdateIntegration(
  workspaceId: string,
  integrationAlias: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<CredentialsIntegration>) => {
      const { data, status } = await patchRequest<CredentialsIntegration>({
        endpoint: `/workspaces/${workspaceId}/integrations/${integrationAlias}`,
        payload,
      });

      if (status !== 200) {
        throw new Error(data);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("Updating integration...");
    },
    onSuccess: (updatedIntegration, _, toastId) => {
      // Update integration in any query where it exists
      queryClient.setQueriesData<
        CredentialsIntegration | PaginatedData<CredentialsIntegration>
      >(
        {
          predicate: (query) =>
            query.queryKey.includes("integrations") ||
            query.queryKey.includes(integrationAlias),
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          if ("data" in oldData) {
            // Update the integration in a list of integrations
            const newData = oldData.data.map((integration) =>
              integration.id === updatedIntegration.id
                ? updatedIntegration
                : integration
            );

            return {
              ...oldData,
              data: newData,
            };
          } else {
            // Update a single integration
            return oldData.id === updatedIntegration.id
              ? updatedIntegration
              : oldData;
          }
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "integration updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toast.update(toastId, {
        render: "Failed to update integration. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
}

export function useDeleteIntegration(
  workspaceId: string,
  integrationAlias: string
) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { status } = await deleteRequest<CredentialsIntegration>({
        endpoint: `/workspaces/${workspaceId}/integrations/${integrationAlias}`,
      });

      if (status !== 200) {
        throw new Error();
      }

      return integrationAlias;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("deleting integration...");
    },
    onSuccess: (integrationAlias, _, toastId) => {
      console.log(integrationAlias);
      // Update integration in any query where it exists
      queryClient.setQueriesData<
        CredentialsIntegration | PaginatedData<CredentialsIntegration>
      >(
        {
          predicate: (query) =>
            query.queryKey.includes("integrations") ||
            query.queryKey.includes(integrationAlias),
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          if ("data" in oldData) {
            // Update the integration in a list of integrations
            return {
              ...oldData,
              data: oldData.data.filter(
                (integration) =>
                  integration.integrationAlias !== integrationAlias
              ),
            };
          } else {
            // Update a single integration
            return undefined;
          }
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Integration deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toast.update(toastId, {
        render: "Failed to delete integration. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
}
