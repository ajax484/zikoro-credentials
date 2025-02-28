import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
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
import { useMutateData } from "@/hooks/services/request";
import { countryList } from "@/components/onboarding/Onboarding";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import useUserStore from "@/store/globalUserStore";
import { optionalUrl } from "./SocialLinks";

const verifySchema = z.object({
  address: z.string().min(1),
  country: z.string(),
  incorporationYear: z.number().min(1900).max(2025),
  document: z.object({
    url: z.string().url("Enter a valid URL"),
    name: z.string().min(1),
  }),
});

const VerifyOrganization = () => {
  const { organization, setOrganization } = useOrganizationStore();
  const { user } = useUserStore();

  const [documentUploading, setDocumentUploading] = useState<boolean>(false);

  const clsBtnRef = useRef<HTMLButtonElement>(null);

  const {
    mutateData: verifyOrganization,
    isLoading: verifyOrganizationIsLoading,
  } = useMutateData(`/workspaces/${organization?.id}/verify`);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      address: organization?.BillingAddress,
      country: "",
      incorporationYear: new Date().getFullYear(),
      document: {
        url: "https://",
        name: "",
      },
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    console.log(data);
    if (!user) return;
    await verifyOrganization({
      payload: {
        ...data,
        status: "pending",
        workspaceAlias: organization?.organizationAlias,
        createdBy: user.id,
      },
    });
  };

  const uploadDocumentFn = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed file types: PNG, JPEG, and PDF
    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PNG or JPEG file");
      return;
    }

    // Check file size (limit: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setDocumentUploading(true);

    const { url, error } = await uploadFile(file, "image");

    if (error) {
      toast.error(error);
      setDocumentUploading(false);
      return;
    }

    if (url) {
      field.onChange({ url, name: file.name });
    }

    setDocumentUploading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-basePrimary text-white">
          Verify Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="px-4 py-6 z-[1000]">
        <DialogHeader className="px-3">
          <DialogTitle>Verify your organization</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <InputOffsetLabel label="Corporate Address">
                  <div className="relative w-full">
                    <Input
                      placeholder="enter address"
                      type="text"
                      {...field}
                      className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </div>
                </InputOffsetLabel>
              )}
            />
            <div className="grid grid-cols-2 gap-4 items-center flex-1">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <InputOffsetLabel label="Country">
                    <div className="relative w-full">
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full rounded-md text-xs font-medium bg-transparent">
                          <SelectValue placeholder={"Select country"} />
                        </SelectTrigger>
                        <SelectContent className="z-[1001]">
                          {countryList?.map((country) => (
                            <SelectItem value={country} key={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </InputOffsetLabel>
                )}
              />
              <FormField
                control={form.control}
                name="incorporationYear"
                render={({ field }) => (
                  <InputOffsetLabel label="Incorporation Year">
                    <div className="relative w-full">
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={String(field.value)}
                      >
                        <SelectTrigger className="w-full rounded-md text-xs font-medium bg-transparent">
                          <SelectValue placeholder={"Select year"} />
                        </SelectTrigger>
                        <SelectContent className="z-[1001]">
                          {Array.from(
                            { length: new Date().getFullYear() - 1900 + 1 },
                            (_, i) => 1900 + i
                          )
                            .sort((a, b) => b - a)
                            .map((year) => (
                              <SelectItem value={String(year)} key={year}>
                                {year}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </InputOffsetLabel>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <InputOffsetLabel label="Document">
                  {field.value.name ? (
                    <p className="text-gray-700 text-xs text-center my-4">
                      {field.value.name}
                    </p>
                  ) : !documentUploading ? (
                    <div className="relative bg-basePrimary/10 rounded-md p-8 flex flex-col gap-2 items-center">
                      <b className="text-sm">
                        Upload a legal business document of your organization
                      </b>
                      <label className="text-basePrimary underline text-sm">
                        <span>Upload Document</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg"
                          onChange={(e) => uploadDocumentFn(e, field)}
                          disabled={documentUploading}
                        />
                      </label>
                      <p className="text-gray-700 text-xs">
                        accepts png, jpeg.
                      </p>
                    </div>
                  ) : (
                    <div className="size-8 border-2 border-gray-300 rounded-full animate-spin border-t-black mx-auto my-8" />
                  )}
                </InputOffsetLabel>
              )}
            />
            <DialogClose asChild>
              <Button className="bg-basePrimary text-white" type="submit">
                Save
              </Button>
            </DialogClose>
          </form>
        </Form>
        <DialogClose asChild>
          <button className="hidden" ref={clsBtnRef}>
            close
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

const WorkspaceSchema = z.object({
  organizationName: z.string().min(3, "Name is required"),
  organizationLogo: optionalUrl,
  eventContactEmail: z.string().email("Enter a valid Email address"),
});

const WorkspaceInformation = () => {
  const { organization, setOrganization } = useOrganizationStore();

  const { mutateData: updateWorkspace, isLoading: updateWorkspaceIsLoading } =
    useMutateData(`/workspaces/${organization?.id}`);

  const form = useForm<z.infer<typeof WorkspaceSchema>>({
    resolver: zodResolver(WorkspaceSchema),
    defaultValues: {
      organizationName: organization?.organizationName || "",
      organizationLogo: organization?.organizationLogo || "",
      eventContactEmail: organization?.eventContactEmail || "",
    },
  });

  useEffect(() => {
    if (!organization) return;
    form.setValue("organizationName", organization?.organizationName || "");
    form.setValue("organizationLogo", organization?.organizationLogo || "");
    form.setValue("eventContactEmail", organization?.eventContactEmail || "");
  }, [organization]);

  const onSubmit = async (data: z.infer<typeof WorkspaceSchema>) => {
    console.log(data);
    const updatedOrganization = await updateWorkspace({
      payload: { ...data },
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

  console.log(organization?.verification);

  const verificationStatus =
    organization?.verification &&
    organization?.verification?.length > 0 &&
    organization?.verification.every((v) => v.status !== "rejected")
      ? organization?.verification.some((v) => v.status === "verified")
        ? "verified"
        : "pending"
      : "unverified";

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
          <Button className="bg-basePrimary text-white mx-auto" type="submit">
            Save
          </Button>
        </form>
      </Form>
      <div className="bg-basePrimary/10 rounded-md p-8 flex flex-col gap-4 items-center font-medium">
        <div className="flex flex-col gap-1 text-center">
          <span className="text-sm">organization status:</span>

          <b
            className={cn(
              "text-xl capitalize",
              verificationStatus === "verified"
                ? "text-green-500"
                : verificationStatus === "pending"
                ? "text-amber-500"
                : "text-gray-800"
            )}
          >
            {verificationStatus}
          </b>
        </div>
        <p className="text-gray-800 text-sm">
          {verificationStatus === "unverified"
            ? "Your organization is unverified and will not have the verified badge on the credential verification page"
            : verificationStatus === "pending"
            ? "Your organization verification is being reviewed"
            : "Your organization has been verified and will have the verified badge on the credential verification page"}
        </p>
        {verificationStatus === "unverified" && <VerifyOrganization />}
      </div>
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
