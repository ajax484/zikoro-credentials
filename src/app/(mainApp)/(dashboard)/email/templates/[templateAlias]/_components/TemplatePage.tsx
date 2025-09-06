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
import { ImageIcon, Link2, X } from "lucide-react";
import {
  getTextColorFromBackground,
  replaceSpecialText,
  uploadFile,
} from "@/utils/helpers";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TOrganization } from "@/types/organization";
import { ColorPicker } from "@/components/editor/components/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { optionalUrl } from "@/app/(mainApp)/(dashboard)/workspace/_components/tabs/SocialLinks";
import { FacebookLogo, InstagramLogo, LinkedinLogo } from "@phosphor-icons/react";

const sendEmailSchema = z.object({
  body: z.string().nonempty("Enter a valid body"),
  subject: z.string().nonempty("Subject is required"),
  senderName: z.string().nonempty("Sender name is required"),
  replyTo: z.string().optional(),
  showLogo: z.boolean().optional(),
  logoUrl: optionalUrl,
  showSocialLinks: z.boolean().optional(),
  templateName: z.string().nonempty("Template name is required"),
  buttonProps: z.object({
    text: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
  }),
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
//             className="mt-4 w-full gap-x-2 hover:bg-opacity-70 bg-basePrimary h-12 rounded-lg text-gray-50 font-medium"
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
      body:  `
      Dear #{first_name#}, 

<br/>
<br/>

Great news, your certificate is ready for download. 

<br/>
<br/>

Click the button to access your certificate.

<br/>
<br/>
<br/>

Congratulations! 

<br/>
<br/>

Event Team.`,
      subject: "Your certificate is ready for download",
      senderName: "Event team",
      replyTo: "",
      showLogo: true,
      logoUrl: organization?.organizationLogo || "",
      showSocialLinks: true,
      buttonProps: {
        text: "View",
        backgroundColor: "rgba(156, 39, 176, 1)",
        textColor: "white",
      },
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
  const buttonProps = form.watch("buttonProps");

  useEffect(() => {
    const color = getTextColorFromBackground(buttonProps.backgroundColor);
    console.log(color, "Color");
    form.setValue("buttonProps.textColor", color);
  }, [buttonProps.backgroundColor]);

  console.log(buttonProps);

  const onSubmit = async (values: z.infer<typeof sendEmailSchema>) => {
    if (!organization) return toast.error("Please select an organization");
    const data = await updateTemplate({
      payload: {
        id: template.id,
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
    template.buttonProps && form.setValue("buttonProps", template.buttonProps);
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
        <section className="grid md:grid-cols-2 gap-4 bg-white py-6 px-2 md:px-8 ">
          <section className="space-y-6">
            <div className="space-y-6 rounded-lg">
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
                    <FormLabel className="bg-[#f7f8ff] p-4 rounded-lg h-[150px] flex justify-center items-center flex-col gap-2 cursor-pointer">
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
            <div className="flex justify-between items-end gap-2">
              <FormField
                name={"buttonProps.text" as const}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1 flex-1">
                    <FormLabel className="text-gray-600">Button Text</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Button Text"
                        defaultValue={"View"}
                        className="w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name={"buttonProps.backgroundColor" as const}
                render={({ field }) => (
                  <FormItem className="!space-y-0">
                    <FormControl>
                      <Popover>
                        <PopoverTrigger>
                          <div
                            style={{ backgroundColor: field.value }}
                            className="size-12 rounded-lg"
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-fit px-8 py-4">
                          <ColorPicker
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            disableTransparent
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
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
            <section className="bg-[#f7f8ff] p-4 rounded-lg border">
              <div className="bg-white border p-4 rounded-lg flex flex-col gap-4 overflow-hidden">
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
                      backgroundColor: buttonProps.backgroundColor,
                      color: buttonProps.textColor,
                      textDecoration: "none",
                      padding: "12px 24px",
                      borderRadius: "5px",
                      fontFamily: "Arial, sans-serif",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {buttonProps.text}
                  </a>
                </div>
                {showSocialLinks && (
                  <div className="flex items-center justify-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <LinkedinLogo className="size-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="size-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <FacebookLogo className="size-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <InstagramLogo className="size-4" />
                    </div>
                    {organization?.socialLinks &&
                      organization?.socialLinks.map((link) => (
                        <div className="flex items-center gap-0.5">
                          <Link2 className="size-4" />
                          <span className="text-sm text-gray-700">
                            {link.title}
                          </span>
                        </div>
                      ))}
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
