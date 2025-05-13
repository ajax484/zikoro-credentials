import { postRequest } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useRegister(workspaceAlias: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data, status } = await postRequest<any>({
        endpoint: `/auth/register`,
        payload,
      });

      if (status !== 201) {
        throw new Error(data.error!);
      }

      return data.data;
    },
    onMutate: () => {
      // Show loading toast
      return toast.loading(`creating account...`);
    },
    onSuccess: (data, { email }, toastId) => {
      // Update toast to success
      toast.update(toastId, {
        render: `Account created successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      router.push(
        `/verify-email?email=${email}&type=verify${
          workspaceAlias ? `&workspaceAlias=${workspaceAlias}` : ""
        }`
      );
    },
    onError: (error, _, toastId) => {
      console.error(error);
      // Update toast to error
      toastId &&
        toast.update(toastId, {
          render: "Failed to create account. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
    },
  });
}
