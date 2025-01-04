"use client";
import { Button } from "@/components/ui/button";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/textEditor/Editor";
import { useGetData, useMutateData } from "@/hooks/services/request";
import { RecipientType } from "./Recipients";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/globalUserStore";
import { CredentialsWorkspaceToken } from "@/types/token";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { toast } from "react-toastify";

const sendEmailSchema = z.object({
  body: z.string().nonempty("Enter a valid body"),
  subject: z.string().nonempty("Subject is required"),
  senderName: z.string().nonempty("Sender name is required"),
  replyTo: z.string().optional(),
});

const SendEmail = ({
  certificate,
  updatePage,
  recipients,
}: {
  certificate: TCertificate;
  updatePage: (page: number) => void;
  recipients: RecipientType;
}) => {
  const { user } = useUserStore();
  const { organization } = useOrganizationStore();
  const router = useRouter();
  const { mutateData, isLoading } = useMutateData(
    `/certificates/${certificate.certificateAlias}/recipients/release`
  );
  const form = useForm<z.infer<typeof sendEmailSchema>>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      body: `
      Dear #{recipientFirstName#},\n

        Great news, your certificate is ready for download. Access it now through this link: View Certificate\n

        Congratulations!\n

        Best,\n

        Team.`,
      subject: "Your certificate is ready for download",
      senderName: "Event team",
      replyTo: "",
    },
  });

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

  const onSubmit = async (data: z.infer<typeof sendEmailSchema>) => {
    if (creditBalance.bronze === 0 || creditBalance.bronze < recipients.length)
      return toast.error("Insufficient credits");

    await mutateData({
      payload: {
        certificateGroupId: certificate.id,
        ...data,
        action: "release",
        recipients,
        status: "email sent",
        createdBy: user?.id,
        workspaceAlias: organization?.organizationAlias,
        workspaceId: organization?.id,
      },
    });
    router.push("/assign");
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800">
            Send {certificate?.name} to recipients
          </h1>
          <Button
            disabled={isLoading}
            className="bg-basePrimary text-white"
            type="button"
            onClick={() => updatePage(0)}
          >
            Back
          </Button>
        </div>
        <div className="space-y-6 bg-white py-6 px-8 rounded-md">
          <FormField
            name={"subject" as const}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-gray-700">Subject</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Subject"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <FormField
                name={"senderName" as const}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">
                      Sender's Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sender Name"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                name={"replyTo" as const}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">Reply To</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Reply To"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            name={"body" as const}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TextEditor
                    value={field.value}
                    onChangeContent={(content) => field.onChange(content)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button
            className="text-basePrimary text-sm border border-basePrimary bg-white hover:bg-white"
            disabled={isLoading}
          >
            Save as template
          </Button>
          <Button
            className="bg-basePrimary text-white"
            type="submit"
            disabled={isLoading}
          >
            Send email ({recipients.length} bronze credits)
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SendEmail;
