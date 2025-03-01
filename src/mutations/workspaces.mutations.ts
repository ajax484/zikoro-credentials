"use client";
import {
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { OrganizationVerification, TOrganization } from "@/types/organization";
import { patchRequest, postRequest } from "@/utils/api";
import { toast } from "react-toastify";
import useOrganizationStore from "@/store/globalOrganizationStore";
import useUserStore from "@/store/globalUserStore";

export function useUpdateWorkspaces(workspaceId: string) {
  const { organization, setOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<TOrganization>) => {
      const { data, status } = await patchRequest<TOrganization>({
        endpoint: `/workspaces/${workspaceId}`,
        payload,
      });

      if (status !== 200) {
        throw new Error(data);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading("Updating workspace...");
    },
    onSuccess: (updatedWorkspace, _, toastId) => {
      setOrganization(updatedWorkspace);
      // Update workspace in any query where it exists
      queryClient.setQueriesData<TOrganization | TOrganization[]>(
        {
          predicate: (query) =>
            query.queryKey.includes("workspaces") ||
            query.queryKey.includes(workspaceId),
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          if (Array.isArray(oldData)) {
            // Update the workspace in a list of workspaces
            return oldData.map((workspace) =>
              workspace.id === updatedWorkspace.id
                ? updatedWorkspace
                : workspace
            );
          } else {
            // Update a single workspace
            return oldData.id === updatedWorkspace.id
              ? updatedWorkspace
              : oldData;
          }
        }
      );

      // Update toast to success
      toast.update(toastId, {
        render: "Workspace updated successfully!",
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

export function useVerifyWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<OrganizationVerification>) => {
      const response = await postRequest<OrganizationVerification>({
        endpoint: `/workspaces/${workspaceId}/verify`,
        payload,
      });

      if (response.status !== 201) {
        throw new Error(response.data as unknown as string);
      }

      return response.data.data; // The updated verification entry
    },
    onMutate: () => {
      return toast.loading("Verifying workspace...");
    },
    onSuccess: (newVerification, _, toastId) => {
      console.log("onSuccess triggered", newVerification);

      // Get all current queries (for debugging)
      console.log("Existing Queries:", queryClient.getQueryCache().getAll());

      queryClient.setQueriesData<TOrganization | TOrganization[]>(
        {
          predicate: (query) =>
            query.queryKey.includes("workspaces") ||
            query.queryKey.includes(workspaceId),
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log("Before update:", oldData);

          const updatedData = Array.isArray(oldData)
            ? oldData.map((workspace) =>
                workspace.organizationAlias === workspaceId
                  ? {
                      ...workspace,
                      verification: [
                        ...(workspace.verification ?? []),
                        newVerification,
                      ],
                    }
                  : workspace
              )
            : oldData.organizationAlias === workspaceId
            ? {
                ...oldData,
                verification: [
                  ...(oldData.verification ?? []),
                  newVerification,
                ],
              }
            : oldData;

          console.log("After update:", updatedData);
          return updatedData;
        }
      );

      toast.update(toastId, {
        render: "Workspace verified successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    },
    onError: (error, _, toastId) => {
      console.error("Mutation Error:", error);
      toast.update(toastId, {
        render: "Failed to verify workspace. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    },
  });
}
