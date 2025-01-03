"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetData } from "@/hooks/services/request";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { TCertificate } from "@/types/certificates";
import { CredentialsWorkspaceToken } from "@/types/token";
import { generateAlias } from "@/utils/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Create Zod schema for recipient form validation
const recipientSchema = z.object({
  recipients: z.array(
    z.object({
      recipientFirstName: z.string().nonempty("First name is required"),
      recipientLastName: z.string().nonempty("Last name is required"),
      recipientEmail: z.string().email("Enter a valid Email address"),
    })
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
  const form = useForm<z.infer<typeof recipientSchema>>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      recipients: mainRecipients || [
        {
          recipientFirstName: "John",
          recipientLastName: "Doe",
          recipientEmail: "johndoe@example.com",
        },
      ],
    },
  });

  const { organization } = useOrganizationStore();

  const { data: credits, isLoading: creditsIsLoading } = useGetData<
    CredentialsWorkspaceToken[]
  >(`/workspaces/${organization?.id}/credits`, []);

  const creditBalance = {
    bronze: credits
      .filter((v) => v.tokenId === 1)
      .reduce((acc, curr) => acc + curr.CreditPurchased, 0),
    silver: credits
      .filter((v) => v.tokenId === 2)
      .reduce((acc, curr) => acc + curr.CreditPurchased, 0),
    gold: credits
      .filter((v) => v.tokenId === 3)
      .reduce((acc, curr) => acc + curr.CreditPurchased, 0),
  };

  const recipients = form.watch("recipients");

  const addRecipient = () => {
    form.setValue("recipients", [
      ...recipients,
      { recipientFirstName: "", recipientLastName: "", recipientEmail: "" },
    ]);
  };

  const updateRecipient = (
    index: number,
    data: {
      recipientFirstName: string;
      recipientLastName: string;
      recipientEmail: string;
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

  const onSubmit = (data: z.infer<typeof recipientSchema>) => {
    console.log(data);
    updateRecipients(
      data.recipients.map((recipient) => ({
        recipientAlias: generateAlias(),
        ...recipient,
      }))
    );
    updatePage(1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800">
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
          {recipients.length} Recipients will receive this Credential. Your
          Bronze Credit balance is {creditBalance.bronze}.{" "}
          {creditBalance.bronze < recipients.length && (
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

        <div className="space-y-6 p-6 rounded-md">
          {recipients.map((recipient, index) => (
            <FormField
              key={index}
              name={`recipients.${index}` as const}
              render={() => (
                <FormItem className="grid grid-cols-[1fr_1fr_2fr_auto] gap-4 items-center">
                  <FormControl>
                    <Input
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
                  <button
                    aria-label="Delete recipient"
                    className="text-red-600"
                    disabled={index === 0}
                    onClick={() => deleteRecipient(index)}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </FormItem>
              )}
            />
          ))}

          <button
            disabled={
              creditBalance.bronze < recipients.length || creditsIsLoading
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
