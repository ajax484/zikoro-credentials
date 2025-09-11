"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetData } from "@/hooks/services/request";
import { useFetchWorkspaceCredits } from "@/queries/credits.queries";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { TCertificate } from "@/types/certificates";
import { CredentialsWorkspaceToken } from "@/types/token";
import { generateAlias, uploadFile } from "@/utils/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pen, Trash } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

// Create Zod schema for recipient form validation
const recipientSchema = z.object({
  recipients: z.array(
    z
      .object({
        recipientFirstName: z
          .string()
          .nonempty("First name is required")
          .optional(),
        recipientLastName: z
          .string()
          .nonempty("Last name is required")
          .optional(),
        recipientEmail: z
          .string()
          .email("Enter a valid Email address")
          .optional(),
        profilePicture: z.string().url("Enter a valid URL"),
        recipientAlias: z.string().optional(),
      })
      .catchall(z.string().optional())
  ),
});

export type RecipientType = z.infer<typeof recipientSchema>["recipients"];

const RecipientsPage = ({
  certificate,
  updatePage,
  recipients: mainRecipients,
  updateRecipients,
}: {
  certificate: TCertificate;
  updatePage: (page: number) => void;
  recipients: RecipientType;
  updateRecipients: (recipients: RecipientType) => void;
}) => {
  console.log(mainRecipients);
  const form = useForm<z.infer<typeof recipientSchema>>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      recipients:
        mainRecipients.length > 0
          ? mainRecipients
          : [
              {
                recipientFirstName: "John",
                recipientLastName: "Doe",
                recipientEmail: "johndoe@example.com",
                profilePicture:
                  "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
              },
            ],
    },
  });

  const { organization } = useOrganizationStore();

  const { data: credits, isFetching: creditsIsLoading } =
    useFetchWorkspaceCredits(organization?.id!);

  const creditBalance = {
    bronze: credits
      .filter((v) => v.tokenId === 1)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
    silver: credits
      .filter((v) => v.tokenId === 2)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
    gold: credits
      .filter((v) => v.tokenId === 3)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
  };

  console.log(creditBalance);

  const recipients = form.watch("recipients");

  const addRecipient = () => {
    form.setValue("recipients", [
      ...recipients,
      {
        recipientFirstName: "",
        recipientLastName: "",
        recipientEmail: "",
        profilePicture:
          "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
      },
    ]);
  };

  const updateRecipient = (
    index: number,
    data: {
      recipientFirstName: string;
      recipientLastName: string;
      recipientEmail: string;
      profilePicture: string;
    }
  ) => {
    const newRecipients = [...recipients];
    newRecipients[index] = data;
    form.setValue("recipients", newRecipients);
  };

  const deleteRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    form.setValue("recipients", newRecipients);
  };

  const [profilePictureUploading, setProfilePictureUploading] =
    useState<boolean>(false);

  const onSubmit = (data: z.infer<typeof recipientSchema>) => {
    console.log(data);
    updateRecipients(
      data.recipients.map((recipient) => ({
        recipientAlias: null,
        ...recipient,
      }))
    );
    updatePage(1);
  };

  console.log(certificate?.hasQRCode);

  const creditType =
    certificate?.attributes && certificate?.attributes.length > 0
      ? "gold"
      : certificate?.hasQRCode
      ? "silver"
      : "bronze";

  console.log(recipients);

  if (creditsIsLoading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-end">
          <h1 className="text-3xl font-semibold text-gray-800 hidden">
            {certificate?.name}
          </h1>
          <Button
            className="bg-basePrimary text-white"
            type="submit"
            disabled={recipients.length === 0}
          >
            Issue to Recipients
          </Button>
        </div>

        <h3 className="text-sm font-medium text-gray-700 text-center">
          {recipients.length} Recipients will receive this Credential. Your{" "}
          {creditType} Credit balance is {creditBalance[creditType]}.{" "}
          {creditBalance[creditType] < recipients.length && (
            <span>
              You do not have sufficient credits to issue this credential to the
              recipients.{" "}
              <Link
                href="/credits/buy"
                className="text-basePrimary underline underline-offset-1"
              >
                Buy more credits
              </Link>
            </span>
          )}{" "}
        </h3>

        <div className="space-y-8 p-6 rounded-lg">
          {recipients.map((recipient, index) => (
            <FormField
              key={index}
              name={`recipients.${index}` as const}
              render={() => (
                <FormItem className="flex gap-4 w-full flex-col items-center md:flex-row">
                  <FormControl className="relative w-fit">
                    <div className="relative h-fit">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={recipient.profilePicture} />
                        <AvatarFallback>
                          {(recipient.recipientFirstName?.[0] || "#") +
                            (recipient.recipientLastName?.[0] || "#")}
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
                            const { url, error } = await uploadFile(
                              file,
                              "image"
                            );

                            if (error) return toast.error(error);
                            // alert("File uploaded successfully");

                            url &&
                              updateRecipient(index, {
                                ...recipient,
                                profilePicture: url,
                              });

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
                  <div className="flex gap-1 md:contents">
                    <div className="grid grid-cols-2 gap-4 items-center flex-1">
                      <FormControl>
                        <Input
                          required
                          placeholder="First Name"
                          value={recipient.recipientFirstName}
                          onChange={(e) =>
                            updateRecipient(index, {
                              ...recipient,
                              recipientFirstName: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          required
                          placeholder="Last Name"
                          value={recipient.recipientLastName}
                          onChange={(e) =>
                            updateRecipient(index, {
                              ...recipient,
                              recipientLastName: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          required
                          type="recipientEmail"
                          placeholder="recipientEmail"
                          value={recipient.recipientEmail}
                          onChange={(e) =>
                            updateRecipient(index, {
                              ...recipient,
                              recipientEmail: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                      {certificate?.attributes &&
                        certificate?.attributes.length > 0 &&
                        certificate?.attributes.map((attribute) => (
                          <FormControl>
                            <Input
                              placeholder={`enter ${attribute}`}
                              value={recipient[attribute] ?? ""}
                              onChange={(e) =>
                                updateRecipient(index, {
                                  ...recipient,
                                  [attribute]: e.target.value,
                                })
                              }
                            />
                          </FormControl>
                        ))}
                    </div>
                    <button
                      aria-label="Delete recipient"
                      className="text-red-600"
                      disabled={index === 0}
                      onClick={() => deleteRecipient(index)}
                      type="button"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </FormItem>
              )}
            />
          ))}

          <button
            disabled={
              creditBalance[creditType] < recipients.length || creditsIsLoading
            }
            onClick={addRecipient}
            className="text-basePrimary text-sm"
          >
            Add new recipient
          </button>
        </div>
      </form>
    </Form>
  );
};

export default RecipientsPage;
