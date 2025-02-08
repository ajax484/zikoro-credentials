import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { Pen, Trash, X } from "lucide-react";
import { uploadFile } from "@/utils/helpers";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Facebook, Instagram, Linkedin } from "styled-icons/bootstrap";
import { useMutateData } from "@/hooks/services/request";

const WorkspaceSchema = z.object({
  organizationName: z.string().min(3, "Name is required"),
  organizationLogo: z.string().url("Enter a valid URL"),
  eventContactEmail: z.string().email("Enter a valid Email address"),
});

const WorkspaceInformation = () => {
  const { organization, setOrganization } = useOrganizationStore();

  const { mutateData: updateWorkspace, isLoading: updateWorkspaceIsLoading } =
    useMutateData(`/workspaces/${organization?.id}`);

  const form = useForm<z.infer<typeof WorkspaceSchema>>({
    resolver: zodResolver(WorkspaceSchema),
    defaultValues: {
      organizationName: organization?.organizationName,
      organizationLogo: organization?.organizationLogo,
      eventContactEmail: organization?.eventContactEmail,
    },
  });

  const onSubmit = async (data: z.infer<typeof WorkspaceSchema>) => {
    console.log(data);
    const updatedOrganization = await updateWorkspace({
      payload: { ...organization, ...data },
    });
    console.log(updatedOrganization);
    setOrganization(updatedOrganization);
  };

  const [profilePictureUploading, setProfilePictureUploading] =
    useState<boolean>(false);

  const DeleteWorkspaceDialog = () => {
    const [workspaceName, setWorkspaceName] = useState<string>("");

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="bg-red-600 text-white border border-red-600 rounded-md px-4 text-sm transition-colors hover:bg-white hover:text-red-600 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="p-2">Delete</span>
          </button>
        </DialogTrigger>
        <DialogContent className="px-4 py-6 z-[1000]">
          <DialogHeader className="px-3">
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <span className="text-sm text-red-600">
              Enter your workspace name to confirm deletion
            </span>
            <Input
              placeholder="workspace name"
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
            />
          </div>
          <DialogFooter>
            <Button
              disabled={workspaceName !== organization?.organizationName}
              // onClick={deleteWorkspace}
              className="bg-basePrimary text-white"
              type="button"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-medium text-gray-600 text-center">
        Edit your workspace information
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name={"organizationLogo"}
            render={({ field }) => (
              <FormItem className="flex gap-4 w-full">
                <FormControl className="relative w-fit mx-auto">
                  <div className="relative h-fit">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={field.value} />
                      <AvatarFallback>OL</AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-1 transition-colors bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!file.type.startsWith("image/")) {
                            toast.error("Please upload an image file");
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("Image size should be less than 5MB");
                            return;
                          }
                          setProfilePictureUploading(true);
                          const { url, error } = await uploadFile(
                            file,
                            "image"
                          );

                          if (error) return toast.error(error);
                          // alert("File uploaded successfully");

                          url && field.onChange(url);

                          setProfilePictureUploading(false);
                        }}
                        disabled={profilePictureUploading}
                      />
                      {profilePictureUploading ? (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full animate-spin border-t-black" />
                      ) : (
                        <Pen className="w-4 h-4" />
                      )}
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4 items-center flex-1">
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <InputOffsetLabel label="Workspace Name">
                  <div className="relative w-full">
                    <Input
                      placeholder="workspace name"
                      type="text"
                      {...field}
                      className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </div>
                </InputOffsetLabel>
              )}
            />
            <FormField
              control={form.control}
              name="eventContactEmail"
              render={({ field }) => (
                <InputOffsetLabel label="Contact Email">
                  <div className="relative w-full">
                    <Input
                      placeholder="contact email"
                      type="text"
                      {...field}
                      className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </div>
                </InputOffsetLabel>
              )}
            />
          </div>
          <Button className="bg-basePrimary text-white" type="submit">
            Save
          </Button>
        </form>
      </Form>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Trash className="size-4" />
          <h3 className="font-medium">Delete Workspace</h3>
        </div>
        <p className="text-sm text-gray-600">
          Deleting a workspace will remove all credentials and credits
          associated with it. This action cannot be undone.
        </p>
        <DeleteWorkspaceDialog />
      </div>
    </div>
  );
};

export default WorkspaceInformation;
