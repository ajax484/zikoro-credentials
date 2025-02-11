"use client";
import { Button } from "@/components/ui/button";
import {
  CertificateRecipient,
  RecipientEmailTemplate,
  TCertificate,
} from "@/types/certificates";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
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
import {
  useGetData,
  useMutateData,
  useUpdateData,
} from "@/hooks/services/request";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/globalUserStore";
import { CredentialsWorkspaceToken } from "@/types/token";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { toast } from "react-toastify";
import { profile } from "console";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { replaceSpecialText, uploadFile } from "@/utils/helpers";
import { Facebook, Instagram, Linkedin, Twitter } from "styled-icons/bootstrap";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TOrganization } from "@/types/organization";
import { LoaderAlt } from "styled-icons/boxicons-regular";

const sendEmailSchema = z.object({
  body: z.string().nonempty("Enter a valid body"),
  subject: z.string().nonempty("Subject is required"),
  senderName: z.string().nonempty("Sender name is required"),
  replyTo: z.string().optional(),
  showLogo: z.boolean().optional(),
  logoUrl: z.string().url().optional(),
  showSocialLinks: z.boolean().optional(),
  templateName: z.string().nonempty("Template name is required"),
});

// const CreateTemplateDialog = ({
//   open,
//   setOpen,
//   createTemplateFn,
//   templateIsCreating,
//   triggerButton,
// }: {
//   open: boolean;
//   setOpen: (open: boolean) => void;
//   createTemplateFn: ({
//     name,
//     workspace,
//   }: {
//     name: string;
//     workspace: TOrganization;
//   }) => void;
//   templateIsCreating: boolean;
//   triggerButton: React.ReactNode;
// }) => {
//   const { organization, setOrganization } = useOrganizationStore();

//   const [workspace, setWorkspace] = useState<TOrganization | null>(
//     organization
//   );

//   const [name, setName] = useState<string>("Untitled Certificate");

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>{triggerButton}</DialogTrigger>
//       <DialogContent className="max-w-[50%]">
//         <DialogHeader>
//           <DialogTitle>Save Template</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-6">
//           <div className="flex flex-col gap-2 w-full">
//             <label className="font-medium text-gray-700">Template Name</label>
//             <Input
//               type="text"
//               placeholder="Enter template name"
//               className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
//               onInput={(e) => setName(e.currentTarget.value)}
//               value={name}
//             />
//           </div>
//         </div>
//         <DialogFooter>
//           <Button
//             onClick={() => {
//               workspace && createTemplateFn({ name, workspace });
//               setOpen(false);
//             }}
//             disabled={templateIsCreating || name === "" || !workspace}
//             className="mt-4 w-full gap-x-2 hover:bg-opacity-70 bg-basePrimary h-12 rounded-md text-gray-50 font-medium"
//           >
//             {templateIsCreating && (
//               <LoaderAlt size={22} className="animate-spin" />
//             )}
//             <span>Create Template</span>
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

const TemplatePage = ({ templateAlias }: { templateAlias: string }) => {
  const { user } = useUserStore();
  const { organization } = useOrganizationStore();
  const router = useRouter();
  const {
    data: template,
    isLoading: templateIsLoading,
    getData: getTemplate,
  } = useGetData<RecipientEmailTemplate>(
    "/certificates/recipients/templates/" + templateAlias,
    []
  );
  const { updateData: updateTemplate, isLoading: templateIsUpdating } =
    useUpdateData(`/certificates/recipients/templates`);

  const form = useForm<z.infer<typeof sendEmailSchema>>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      body: `
      Dear #{first_name#},\n

        Great news, your certificate is ready for download. Access it now through this link: View Certificate\n

        Congratulations!\n

        Best,\n

        Team.`,
      subject: "Your certificate is ready for download",
      senderName: "Event team",
      replyTo: "",
      showLogo: true,
      logoUrl: organization?.organizationLogo || "",
      showSocialLinks: true,
    },
  });

  // const onSubmit = async (data: z.infer<typeof sendEmailSchema>) => {
  //   if (
  //     creditBalance[creditType] === 0 ||
  //     creditBalance[creditType] < recipients.length
  //   )
  //     return toast.error(`Insufficient ${creditType} credits`);

  //   await mutateData({
  //     payload: {
  //       certificateGroupId: certificate.id,
  //       ...data,
  //       action: "release",
  //       recipients: recipients.map(
  //         ({
  //           recipientEmail,
  //           recipientFirstName,
  //           recipientLastName,
  //           logoUrl,
  //           ...metadata
  //         }) => ({
  //           metadata,
  //           recipientEmail: recipientEmail.trim(),
  //           recipientFirstName: recipientFirstName.trim(),
  //           recipientLastName: recipientLastName.trim(),
  //           logoUrl,
  //         })
  //       ),
  //       status: "email sent",
  //       createdBy: user?.id,
  //       workspaceAlias: organization?.organizationAlias,
  //       workspaceId: organization?.id,
  //       organization,
  //     },
  //   });
  //   router.push("/assign");
  // };

  const [logoUrlUploading, setLogoUrlUploading] = useState<boolean>(false);

  const logoUrl = form.watch("logoUrl");
  const body = form.watch("body");
  const showLogo = form.watch("showLogo");
  const showSocialLinks = form.watch("showSocialLinks");

  const onSubmit = async (values: z.infer<typeof sendEmailSchema>) => {
    if (!organization) return toast.error("Please select an organization");
    const data = await updateTemplate({
      payload: {
        workspaceAlias: organization.organizationAlias,
        createdBy: user?.id,
        ...values,
      },
    });

    if (!data) return;
  };

  useEffect(() => {
    if (templateIsLoading) return;
    if (!template) return;
    form.setValue("templateName", template.templateName);
    form.setValue("subject", template.subject);
    form.setValue("senderName", template.senderName);
    form.setValue("replyTo", template.replyTo || "");
    form.setValue("logoUrl", template.logoUrl || "");
    form.setValue("body", template.body);
    form.setValue("showLogo", template.showLogo);
    form.setValue("showSocialLinks", template.showSocialLinks);
  }, [templateIsLoading]);

  if (templateIsLoading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-center">
          <FormField
            name={"templateName" as const}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="text"
                    className="outline-0 bg-transparent border-0 min-w-[250px] text-center max-w-fit !shadow-none px-4 focus-visible:ring-sky-300 focus-visible:ring-2 flex justify-center mx-auto border-b"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <section className="grid grid-cols-2 gap-4 bg-white py-6 px-8 ">
          <section className="space-y-6">
            <div className="space-y-6 rounded-md">
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
                        <FormLabel className="text-gray-700">
                          Reply To
                        </FormLabel>
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
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg text-gray-800 font-medium">Logo</span>
                <FormField
                  name={"showLogo" as const}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="text-gray-600">
                        Show Organisation Logo
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={() => field.onChange(!field.value)}
                          className="data-[state=checked]:bg-basePrimary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                name={"logoUrl" as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="bg-[#f7f8ff] p-4 rounded-md h-[150px] flex justify-center items-center flex-col gap-2 cursor-pointer">
                      {field.value ? (
                        <Image
                          src={field.value}
                          alt="logo"
                          width={100}
                          height={50}
                        />
                      ) : (
                        <>
                          <ImageIcon className="size-4" />
                          <span className="text-sm text-sky-600 hover:text-sky-700 underline block text-center">
                            Upload Logo
                          </span>
                        </>
                      )}
                      <FormControl>
                        <Input
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
                            setLogoUrlUploading(true);
                            const { url, error } = await uploadFile(
                              file,
                              "image"
                            );

                            if (error) return toast.error(error);
                            // alert("File uploaded successfully");

                            url && field.onChange(url);

                            setLogoUrlUploading(false);
                          }}
                          disabled={logoUrlUploading}
                        />
                      </FormControl>
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-800 font-medium">
                Social Links
              </span>
              <FormField
                name={"showSocialLinks" as const}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel className="text-gray-600">
                      Show Social Links
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={() => field.onChange(!field.value)}
                        className="data-[state=checked]:bg-basePrimary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </section>
          <section className="space-y-2">
            <span className="text-sm text-gray-700 font-medium">
              Email Preview
            </span>
            <section className="bg-[#f7f8ff] p-4 rounded-md border">
              <div className="bg-white border p-4 rounded-md flex flex-col gap-4 overflow-hidden">
                <div className="mx-auto">
                  {showLogo && logoUrl && (
                    <Image src={logoUrl} alt="logo" width={100} height={50} />
                  )}
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceSpecialText(body || "", {
                      recipient: {
                        recipientEmail: "johndoe@gmail.com",
                        recipientFirstName: "John",
                        recipientLastName: "Doe",
                        certificateId: "12345678",
                      },
                      organization,
                    }),
                  }}
                />
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                    fontStyle: "italic",
                  }}
                >
                  <p style={{ marginBottom: "20px" }}>
                    View in a desktop screen for best experience
                  </p>
                  <a
                    href={"#"}
                    style={{
                      display: "inline-block",
                      backgroundColor: "#9D00FF",
                      color: "white",
                      textDecoration: "none",
                      padding: "12px 24px",
                      borderRadius: "5px",
                      fontFamily: "Arial, sans-serif",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    View
                  </a>
                </div>
                {showSocialLinks && (
                  <div className="flex items-center justify-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Linkedin className="size-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="size-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Facebook className="size-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Instagram className="size-4" />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </section>
        </section>
        <div className="flex items-center justify-center gap-4">
          <Button
            type="submit"
            className="bg-basePrimary text-white"
            disabled={templateIsLoading || templateIsUpdating}
          >
            Save template
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TemplatePage;
