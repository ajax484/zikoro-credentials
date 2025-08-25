import { directoryRecipientSchema } from "@/schemas/directory";
import { DirectoryRecipient } from "@/types/directories";
import { PaginatedData } from "@/types/request";
import { postRequest } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { z } from "zod";

export function useCreateDirectoryRecipient(
  organizationAlias: string,
  directoryAlias: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Partial<z.infer<typeof directoryRecipientSchema>>
    ) => {
      const { data, status } = await postRequest<DirectoryRecipient>({
        endpoint: `/workspaces/${organizationAlias}/directories/${directoryAlias}/recipients`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data.error!);
      }

      return data.data;
    },
    onMutate: ({ name }) => {
      // Show loading toast
      return toast.loading(`adding recipient to directory ...`);
    },
    onSuccess: (DirectoryRecipient, _, toastId) => {
      console.log(DirectoryRecipient);
      // Update workspace in any query where it exists
      queryClient.setQueriesData<
        | PaginatedData<DirectoryRecipient>
        | DirectoryRecipient[]
        | DirectoryRecipient
      >(
        {
          predicate: (query) =>
            query.queryKey.includes("directory recipients") &&
            (query.queryKey.includes(directoryAlias) ||
              query.queryKey.includes(DirectoryRecipient.recipientAlias)),
        },
        (oldData) => {
          if (!oldData) return oldData;

          console.log(oldData);

          if (Array.isArray(oldData)) {
            return [DirectoryRecipient, ...oldData];
          } else if ("data" in oldData) {
            return {
              ...oldData,
              data: [DirectoryRecipient, ...oldData.data],
            };
          } else {
            return DirectoryRecipient;
          }
        }
      );

      console.log(DirectoryRecipient);
      // Update toast to success
      toast.update(toastId, {
        render: `Recipient added to directory successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return DirectoryRecipient;
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toastId &&
        toast.update(toastId, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
    },
  });
}
