import { Button } from "@/components/custom/Button";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { TOrganization } from "@/types/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pen } from "lucide-react";
import { toast } from "react-toastify";
import { uploadFile } from "@/utils/helpers";

// Create Zod schema for recipient form validation
const recipientSchema = z
  .object({
    recipientFirstName: z
      .string()
      .nonempty("First name is required")
      .optional(),
    recipientLastName: z.string().nonempty("Last name is required").optional(),
    recipientEmail: z.string().email("Enter a valid Email address").optional(),
    profilePicture: z.string().url("Enter a valid URL"),
  })
  .catchall(z.string().nonempty("Additional fields must be non-empty strings"));

const Information = ({
  recipient,
  getCertificate,
}: {
  recipient: CertificateRecipient & {
    originalCertificate: TCertificate & {
      workspace: TOrganization;
    };
  };
  getCertificate: () => Promise<void>;
}) => {
  const form = useForm<z.infer<typeof recipientSchema>>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      recipientFirstName: recipient.recipientFirstName,
      recipientLastName: recipient.recipientLastName,
      recipientEmail: recipient.recipientEmail,
      profilePicture:
        recipient.profilePicture ??
        "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
      ...(recipient.metadata ?? {}),
    },
  });

  const { updateData: updateRecipient, isLoading: updating } = useUpdateData(
    `/certificates/recipients/certificates/${recipient.certificateId}`
  );

  const onSubmit = async (data: z.infer<typeof recipientSchema>) => {
    const {
      recipientFirstName,
      recipientLastName,
      recipientEmail,
      profilePicture,
      ...rest
    } = data;

    await updateRecipient({
      payload: {
        metadata: {
          ...rest,
        },
        recipientFirstName,
        recipientLastName,
        recipientEmail,
        profilePicture,
        id,
        statusDetails: statusDetails
          ? [
              ...statusDetails,
              {
                action: "updated",
                date: new Date().toISOString(),
              },
            ]
          : [
              {
                action: "updated",
                date: new Date().toISOString(),
              },
            ],
      },
    });
    await getCertificate();
  };

  useEffect(() => {
    form.setValue("recipientFirstName", recipient.recipientFirstName);
    form.setValue("recipientLastName", recipient.recipientLastName);
    form.setValue("recipientEmail", recipient.recipientEmail);
    form.setValue(
      "profilePicture",
      recipient.profilePicture ??
        "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg"
    );
    metadata &&
      Object.keys(metadata).forEach((key) => {
        form.setValue(key, recipient.metadata[key]);
      });
  }, [recipient]);

  const {
    metadata,
    originalCertificate,
    id,
    isValid,
    status,
    statusDetails,
    certificateGroupId,
    created_at,
    certificateId,
    recipientAlias,
    profilePicture,
    integrationAlias,
    ...rest
  } = recipient;

  console.log(metadata);

  const [profilePictureUploading, setProfilePictureUploading] =
    useState<boolean>(false);

  const newProfilePicture = form.watch("profilePicture");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name={"profilePicture" as const}
          render={({ field }) => (
            <FormItem className="flex gap-4 w-full">
              <FormControl className="relative w-fit">
                <div className="relative h-fit">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={newProfilePicture} />
                    <AvatarFallback>
                      {(recipient.recipientFirstName[0] || "#") +
                        (recipient.recipientLastName[0] || "#")}
                    </AvatarFallback>
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
                        const { url, error } = await uploadFile(file, "image");

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
            </FormItem>
          )}
        />
        {Object.keys(rest).map((key) => {
          return (
            <FormField
              disabled={key === "recipientEmail" || key === "recipientAlias"}
              key={key}
              control={form.control}
              name={key}
              render={({ field }) => (
                <InputOffsetLabel label={key}>
                  <Input
                    placeholder={key}
                    type="text"
                    {...field}
                    className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                  />
                </InputOffsetLabel>
              )}
            />
          );
        })}
        {metadata &&
          Object.keys(metadata).map((key) => {
            return (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <InputOffsetLabel label={key}>
                    <Input
                      placeholder={key}
                      type="text"
                      {...field}
                      className="placeholder:text-sm focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                    />
                  </InputOffsetLabel>
                )}
              />
            );
          })}
        <Button
          className="bg-basePrimary text-white"
          type="submit"
          disabled={updating}
        >
          Update
        </Button>
      </form>
    </Form>
  );
};

export default Information;
