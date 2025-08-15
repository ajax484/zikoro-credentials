"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { useState } from "react";
import { DirectoryRecipient } from "@/types/directories";
import { directoryRecipientSchema } from "@/schemas/directory";
import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  TwitterLogo,
  XLogo,
} from "@phosphor-icons/react";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { useCreateDirectoryRecipient } from "@/mutations/directories.mutations";
import { generateAlias } from "@/utils/helpers";
import { useRouter } from "next/navigation";

export default function AddRecipientForm({
  onClose,
  directoryAlias,
}: {
  directoryAlias: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { organization } = useOrganizationStore();
  const { mutateAsync: createDirectoryRecipient, isPending: isLoading } =
    useCreateDirectoryRecipient(
      organization?.organizationAlias!,
      directoryAlias
    );

  // Default values handling
  const defaultValues: Partial<DirectoryRecipient> = {
    directoryAlias,
    recipientAlias: generateAlias(),
  };

  const form = useForm<DirectoryRecipient>({
    resolver: zodResolver(directoryRecipientSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    formState: { errors, touchedFields },
    reset,
  } = form;

  console.log(errors);

  async function onSubmit(data: z.infer<typeof directoryRecipientSchema>) {
    console.log(data);

    const directoryRecipient = await createDirectoryRecipient(data);

    if (directoryRecipient) {
      router.push(`/workspaces/directory/${directoryRecipient.directoryAlias}`);
    }

    console.log(directoryRecipient);
    onClose();
  }

  const [profilePictureIsUploading, setProfilePictureUploading] =
    useState(false);

  return (
    <div>
      <Form {...form}>
        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <h1 className="font-semibold">Add Member</h1>
          {/* Mandatory Fields - Always Shown */}
          <div className="flex-1">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <InputOffsetLabel isRequired label="First name">
                  <Input
                    placeholder="Enter first name"
                    {...field}
                    className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 !shadow-none !border-none mt-0"
                  />
                </InputOffsetLabel>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <InputOffsetLabel isRequired label="Last name">
                  <Input
                    placeholder="Enter last name"
                    {...field}
                    className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 !shadow-none !border-none"
                  />
                </InputOffsetLabel>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <InputOffsetLabel label="Email">
                <Input
                  placeholder="Enter email"
                  {...field}
                  className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 !shadow-none !border-none"
                />
              </InputOffsetLabel>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <InputOffsetLabel label="phone number">
                <Input
                  placeholder="Enter phone number"
                  {...field}
                  className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 !shadow-none !border-none"
                />
              </InputOffsetLabel>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <InputOffsetLabel
                  label="X (Formerly Twitter)"
                  append={<XLogo size={24} weight="duotone" />}
                >
                  <Input
                    placeholder="https://www.x.com/"
                    {...field}
                    className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 !shadow-none !border-none !border-none"
                  />
                </InputOffsetLabel>
              )}
            />
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <InputOffsetLabel
                  label="LinkedIn"
                  append={<LinkedinLogo size={24} weight="duotone" />}
                >
                  <Input
                    placeholder="https://www.linkedin.com/"
                    {...field}
                    className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 !shadow-none !border-none"
                  />
                </InputOffsetLabel>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <InputOffsetLabel
                  label="Instagram"
                  append={<InstagramLogo size={24} weight="duotone" />}
                >
                  <Input
                    placeholder="https://www.instagram.com/"
                    {...field}
                    className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 !shadow-none !border-none"
                  />
                </InputOffsetLabel>
              )}
            />
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <InputOffsetLabel
                  label="Facebook"
                  append={<FacebookLogo size={24} weight="duotone" />}
                >
                  <Input
                    placeholder="https://www.facebook.com/"
                    {...field}
                    className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 !shadow-none !border-none"
                  />
                </InputOffsetLabel>
              )}
            />
          </div>
          {/* <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className="absolute top-0 -translate-y-1/2 right-4 bg-white text-gray-600 text-tiny px-1">
                  Website
                </FormLabel>
                <span className="text-sm absolute translate-y-1/2 right-4 text-gray-700 z-10 font-medium">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth={0}
                    viewBox="0 0 496 512"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z" />
                  </svg>
                </span>
                <FormControl>
                  <Input
                    className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 !shadow-none !border-none pr-12"
                    placeholder="https://www.orthoex.ng/"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <Button
            type="submit"
            className="bg-basePrimary w-full"
            disabled={isLoading || profilePictureIsUploading}
          >
            {isLoading ? "Adding..." : "Add Member"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
