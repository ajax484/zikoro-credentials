"use client";
import { Button } from "@/components/ui/button";
import { RecipientEmailTemplate, TCertificate } from "@/types/certificates";
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
import { useGetData, useMutateData } from "@/hooks/services/request";
import { RecipientType } from "./Recipients";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/globalUserStore";
import { CredentialsWorkspaceToken } from "@/types/token";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { toast } from "react-toastify";
import { profile } from "console";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { ImageIcon, Link2, Loader, X } from "lucide-react";
import {
  generateAlphanumericHash,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/editor/components/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { optionalUrl } from "@/app/(mainApp)/(dashboard)/workspace/_components/tabs/SocialLinks";
import { useFetchWorkspaceCredits } from "@/queries/credits.queries";
import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
} from "@phosphor-icons/react";
import { useIssueCertificates } from "@/mutations/certificates.mutations";

const sendEmailSchema = z.object({
  body: z.string().nonempty("Enter a valid body"),
  subject: z.string().nonempty("Subject is required"),
  header: z.string().nonempty("Header is required"),
  senderName: z.string().nonempty("Sender name is required"),
  replyTo: z.string().optional(),
  showLogo: z.boolean().optional(),
  logoUrl: optionalUrl,
  showCustomLinks: z.boolean().optional(),
  showSocialLinks: z.boolean().optional(),
  buttonProps: z.object({
    text: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
  }),
});

const CreateTemplateDialog = ({
  open,
  setOpen,
  createTemplateFn,
  templateIsCreating,
  triggerButton,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  createTemplateFn: ({
    name,
    workspace,
  }: {
    name: string;
    workspace: TOrganization;
  }) => void;
  templateIsCreating: boolean;
  triggerButton: React.ReactNode;
}) => {
  const { organization, setOrganization } = useOrganizationStore();

  const [workspace, setWorkspace] = useState<TOrganization | null>(
    organization
  );

  const [name, setName] = useState<string>("Untitled credential");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-[50%]">
        <DialogHeader>
          <DialogTitle>Save Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">Template Name</label>
            <Input
              type="text"
              placeholder="Enter template name"
              className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
              onInput={(e) => setName(e.currentTarget.value)}
              value={name}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              workspace && createTemplateFn({ name, workspace });
              setOpen(false);
            }}
            disabled={templateIsCreating || name === "" || !workspace}
            className="mt-4 w-full gap-x-2 hover:bg-opacity-70 bg-basePrimary h-12 rounded-lg text-gray-50 font-medium"
          >
            {templateIsCreating && (
              <Loader size={22} className="animate-spin" />
            )}
            <span>Create Template</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
  const {
    data: templates,
    isLoading: templatesIsLoading,
    getData: getTemplates,
  } = useGetData<RecipientEmailTemplate[]>(
    `/workspaces/${organization?.organizationAlias}/certificates/recipients/templates`,
    []
  );

  const { mutateAsync: issueCertificates, isPending: issuingCertificates } =
    useIssueCertificates(certificate?.certificateAlias);
  const { mutateData: createTemplate, isLoading: templateIsCreating } =
    useMutateData(`/certificates/recipients/templates`);

  const form = useForm<z.infer<typeof sendEmailSchema>>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      body: `
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
      header: "Your certificate is ready for download",
      senderName: "Event team",
      replyTo: "",
      showLogo: true,
      logoUrl: organization?.organizationLogo || "",
      showSocialLinks: true,
      showCustomLinks: true,
      buttonProps: {
        text: "View",
        backgroundColor: "rgba(156, 39, 176, 1)",
        textColor: "white",
      },
    },
  });

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

  const onSubmit = async (data: z.infer<typeof sendEmailSchema>) => {
    console.log(creditBalance[creditType], recipients.length, creditType);
    if (!user) return toast.error("Please login to send certificate");
    if (
      creditBalance[creditType] === 0 ||
      creditBalance[creditType] < recipients.length
    )
      return toast.error(`Insufficient ${creditType} credits`);

    await issueCertificates({
      certificateGroupId: certificate.id,
      ...data,
      action: "release",
      recipients: recipients.map(
        ({
          recipientEmail,
          recipientFirstName,
          recipientLastName,
          recipientAlias,
          profilePicture,
          logoUrl,
          ...metadata
        }) => ({
          metadata,
          recipientEmail: recipientEmail.trim(),
          recipientFirstName: recipientFirstName.trim(),
          recipientLastName: recipientLastName.trim(),
          recipientAlias: recipientAlias ? recipientAlias.trim() : null,
          profilePicture,
          logoUrl,
        })
      ),
      status: "email sent",
      createdBy: user?.id,
      workspaceAlias: organization?.organizationAlias,
      workspaceId: organization?.id,
      organization,
    });
    router.push("/designs/" + certificate.certificateAlias + "/assign");
  };

  const creditType =
    certificate?.attributes && certificate?.attributes.length > 0
      ? "gold"
      : certificate?.hasQRCode
      ? "silver"
      : "bronze";

  const [logoUrlUploading, setLogoUrlUploading] = useState<boolean>(false);

  const logoUrl = form.watch("logoUrl");
  const body = form.watch("body");
  const header = form.watch("header");
  const showLogo = form.watch("showLogo");
  const showCustomLinks = form.watch("showCustomLinks");
  const showSocialLinks = form.watch("showSocialLinks");
  const buttonProps = form.watch("buttonProps");

  useEffect(() => {
    if (!buttonProps) return;
    const color = getTextColorFromBackground(buttonProps?.backgroundColor);
    console.log(color, "Color");
    form.setValue("buttonProps.textColor", color);
  }, [buttonProps?.backgroundColor]);

  const [open, setOpen] = useState(false);

  const createTemplateFn = async ({ name }: { name: string }) => {
    if (!organization) return toast.error("Please select an organization");
    const templateAlias = generateAlphanumericHash(12);
    const values = form.getValues();
    const data = await createTemplate({
      payload: {
        ...values,
        workspaceAlias: organization.organizationAlias,
        templateName: name,
        createdBy: user?.id,
        templateAlias,
      },
    });

    if (!data) return;

    await getTemplates();
  };

  const [currentTemplate, setTemplate] =
    useState<RecipientEmailTemplate | null>(null);

  console.log(certificate);
  console.log(form.formState.errors);

  if (creditsIsLoading) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            Send {certificate?.name} to recipients
          </h1>
          <Select
            disabled={templatesIsLoading}
            value={String(currentTemplate?.id)}
            onValueChange={(value) => {
              const template = templates?.find(
                ({ id }) => id === parseInt(value)
              );
              if (!template) return;
              setTemplate(template);
              form.setValue("subject", template.subject);
              form.setValue("senderName", template.senderName);
              form.setValue("replyTo", template.replyTo || "");
              form.setValue("logoUrl", template.logoUrl || "");
              form.setValue("body", template.body);
              form.setValue("header", "Your certificate is ready for download");
              form.setValue("showLogo", template.showLogo);
              form.setValue("showSocialLinks", template.showSocialLinks);
              form.setValue("buttonProps", template.buttonProps);
            }}
          >
            <SelectTrigger className="rounded-lg bg-white font-medium w-1/2">
              <SelectValue placeholder={"Select a template"} />
            </SelectTrigger>
            <SelectContent>
              {templates?.map(({ templateName, id }) => (
                <SelectItem value={String(id)} key={id}>
                  {templateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={issuingCertificates}
            className="bg-basePrimary text-white"
            type="button"
            onClick={() => updatePage(0)}
          >
            Back
          </Button>
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
                name={"header" as const}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">Header</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Header"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg text-gray-800 font-medium">
                  Custom Links
                </span>
                <FormField
                  name={"showCustomLinks" as const}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="text-gray-600">
                        Show Custom Links
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
              <span className="text-xs text-gray-600 font-medium">
                Add custom links in your workspace settings
              </span>
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
                <div>
                  <h1 className="text-2xl font-medium">{header}</h1>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: replaceSpecialText(body, {
                        recipient: {
                          ...recipients[0],
                          certificateId: 12345678,
                        },
                        organization,
                      }),
                    }}
                  />
                </div>
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
                      backgroundColor: buttonProps?.backgroundColor,
                      color: buttonProps?.textColor,
                      textDecoration: "none",
                      padding: "12px 24px",
                      borderRadius: "5px",
                      fontFamily: "Arial, sans-serif",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {buttonProps?.text}
                  </a>
                </div>
                {showCustomLinks && (
                  <div className="flex items-center justify-center gap-4 text-gray-600">
                    {organization?.socialLinks &&
                      organization?.socialLinks.map((link) => (
                        <div className="flex items-center gap-0.5 underline">
                          <span className="text-sm text-gray-700">
                            {link.title}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
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
                  </div>
                )}
              </div>
            </section>
          </section>
        </section>
        <div className="flex items-center justify-center gap-4">
          <CreateTemplateDialog
            templateIsCreating={templateIsCreating}
            open={open}
            setOpen={setOpen}
            createTemplateFn={createTemplateFn}
            triggerButton={
              <Button
                type="button"
                className="text-basePrimary text-sm border border-basePrimary bg-white hover:bg-white"
                disabled={issuingCertificates}
              >
                Save as template
              </Button>
            }
          />
          <Button
            className="bg-basePrimary text-white"
            type="submit"
            disabled={issuingCertificates}
          >
            Send email ({recipients.length} {creditType} credits)
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SendEmail;
