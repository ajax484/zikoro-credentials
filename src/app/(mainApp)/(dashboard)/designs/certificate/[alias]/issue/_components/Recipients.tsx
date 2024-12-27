"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Create Zod schema for recipient form validation
const recipientSchema = z.object({
  recipients: z.array(
    z.object({
      firstName: z.string().nonempty("First name is required"),
      lastName: z.string().nonempty("Last name is required"),
      email: z.string().email("Enter a valid email address"),
    })
  ),
});

const RecipientsPage = ({
  certificate,
  updatePage,
  recipients: mainRecipients,
  updateRecipients,
}: {
  certificate: TCertificate;
  updatePage: (page: number) => void;
  recipients: CertificateRecipient[];
  updateRecipients: (recipients: []) => void;
}) => {
  const form = useForm<z.infer<typeof recipientSchema>>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      recipients: mainRecipients || [
        {
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@example.com",
        },
      ],
    },
  });

  const recipients = form.watch("recipients");

  const addRecipient = () => {
    form.setValue("recipients", [
      ...recipients,
      { firstName: "", lastName: "", email: "" },
    ]);
  };

  const updateRecipient = (
    index: number,
    data: { firstName: string; lastName: string; email: string }
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
    updateRecipients(data.recipients);
    updatePage(1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800">
            {certificate?.name}
          </h1>
          <Button className="bg-basePrimary text-white" type="submit">
            Issue to Recipients
          </Button>
        </div>

        <h3 className="text-sm font-medium text-gray-700 text-center">
          Add recipients to receive certificates
        </h3>

        <div className="space-y-6 border bg-white p-6 rounded-md">
          {recipients.map((recipient, index) => (
            <FormField
              key={index}
              name={`recipients.${index}` as const}
              render={() => (
                <FormItem className="grid grid-cols-[1fr_1fr_2fr_auto] gap-4 items-center">
                  <FormControl>
                    <Input
                      placeholder="First Name"
                      value={recipient.firstName}
                      onChange={(e) =>
                        updateRecipient(index, {
                          ...recipient,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <Input
                      placeholder="Last Name"
                      value={recipient.lastName}
                      onChange={(e) =>
                        updateRecipient(index, {
                          ...recipient,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={recipient.email}
                      onChange={(e) =>
                        updateRecipient(index, {
                          ...recipient,
                          email: e.target.value,
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

          <button onClick={addRecipient} className="text-basePrimary text-sm">
            Add new recipient
          </button>
        </div>
      </form>
    </Form>
  );
};

export default RecipientsPage;
