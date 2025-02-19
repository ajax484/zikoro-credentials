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
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    await updateRecipient({
      payload: {
        ...data,
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
    ...rest
  } = recipient;

  console.log(metadata);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
