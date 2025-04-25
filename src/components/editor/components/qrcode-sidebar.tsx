import { ActiveTool, Editor } from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ColorPicker } from "@/components/editor/components/color-picker";
import { toast } from "react-toastify";
import useUserStore from "@/store/globalUserStore";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface QRCodeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  getCredits: () => Promise<void>;
  creditBalance: {
    bronze: number;
    silver: number;
    gold: number;
  };
  credentialId: number;
  workspaceId: string;
  chargeCredits: ({
    payload,
  }: {
    payload: {
      amountToCharge: number;
      activityBy: number;
      credentialId: number;
      workspaceId: number;
      tokenId: number;
    };
  }) => Promise<void>;
  isMutating: boolean;
  creditsIsLoading: boolean;
  type: "certificate" | "badge";
  workspaceAlias: string;
  toggleQRCode: (value: boolean) => void;
  hasQRCode: boolean;
}

export const barCodeTypeEnum = z.enum([
  "aztec",
  "codabar",
  "128",
  "39",
  "dm",
  "13",
  "8",
  "14",
  "pdf417",
  "qr",
  "royal",
  "a",
  "e",
  "usps",
]);

const QRCodeSchema = z.object({
  text: z.string({
    required_error: "QR Code text is required",
  }),

  color: z.string({
    required_error: "QR Code color is required",
  }),

  bgcolor: z.string({
    required_error: "QR Code background color is required",
  }),

  barCodeType: barCodeTypeEnum,
});

const barCodeTypes: { label: string; value: string; regex: RegExp }[] = [
  {
    label: "Aztec",
    value: "aztec",
    regex: /^[ !\"#$%&\'()*+,\-.\/0-9:;<=>?@A-Z\[\]^_`a-z{|}~]+$/,
  },
  {
    label: "Codabar",
    value: "codabar",
    regex: /^[0-9\-:$\/.+]{1,22}$/,
  },
  {
    label: "Code 128",
    value: "128",
    regex: /^[ !\"#$%&\'()*+,\-.\/0-9:;<=>?@A-Z\[\]^_`a-z{|}~]{1,48}$/,
  },
  {
    label: "Code 39",
    value: "39",
    regex: /^[A-Z*0-9 \-$%.\/+]{1,30}$/,
  },
  {
    label: "DataMatrix",
    value: "dm",
    regex: /^[ !\"#$%&\'()*+,\-.\/0-9:;<=>?@A-Z\[\]^_`a-z{|}~]{1,2335}$/,
  },
  {
    label: "EAN-13",
    value: "13",
    regex: /^[0-9]{12,13}$/,
  },
  {
    label: "EAN-8",
    value: "8",
    regex: /^[0-9]{7,8}$/,
  },
  {
    label: "ITF-14",
    value: "14",
    regex: /^[0-9]{14}$/,
  },
  {
    label: "PDF417",
    value: "pdf417",
    regex: /^[ !\"#$%&\'()*+,\-.\/0-9:;<=>?@A-Z\[\]^_`a-z{|}~]{1,2335}$/,
  },
  {
    label: "QR Code",
    value: "qr",
    regex: /^.{1,65535}$/,
  },
  {
    label: "Royal Mail",
    value: "royal",
    regex: /^[0-9]{1,32}$/,
  },
  {
    label: "UPC-A",
    value: "a",
    regex: /^(?=.*0)[0-9]{11,12}$/,
  },
  {
    label: "UPC-E",
    value: "e",
    regex: /^(?=.*0)[0-9]{7,8}$/,
  },
  {
    label: "USPS Mail",
    value: "usps",
    regex: /^[0-9]{1,32}$/,
  },
];

export const QRCodeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  getCredits,
  creditBalance,
  credentialId,
  workspaceId,
  chargeCredits,
  isMutating,
  creditsIsLoading,
  type,
  workspaceAlias,
  toggleQRCode,
  hasQRCode,
}: QRCodeSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const { user } = useUserStore();

  const [barCodeFunction, setBarCodeFunction] = useState<
    "verify" | "attribute" | "custom"
  >("verify");

  const form = useForm<z.infer<typeof QRCodeSchema>>({
    resolver: zodResolver(QRCodeSchema),
    defaultValues: {
      text: "https://credentials.zikoro.com/credentials/verify/certificate/#{certificateId#}",
      color: "#000000",
      bgcolor: "#ffffff",
      barCodeType: "qr",
    },
  });

  const onSubmit = async (data: z.infer<typeof QRCodeSchema>) => {
    console.log(data);

    if (!user) return;

    // if (creditBalance.silver === 0) {
    //   toast.error("Insufficient balance to complete the charge.");
    //   return;
    // }

    const payload = {
      amountToCharge: 1,
      activityBy: user?.id,
      credentialId,
      workspaceAlias,
      workspaceId,
      tokenId: 2,
      credentialType: type,
    };

    try {
      // await chargeCredits({ payload });
      // await getCredits();
      // toast.success("QR Code charged successfully.");
      editor?.addQRCode(data.text, data.color, data.bgcolor, data.barCodeType);
      toggleQRCode(true);
    } catch (error) {
      toast.error("Failed to charge QR Code.");
    }
  };

  const text = form.watch("text");

  useEffect(() => {
    if (barCodeFunction === "verify") {
      form.setValue(
        "text",
        "https://credentials.zikoro.com/credentials/verify/certificate/#{certificateId#}"
      );
    }
  }, [barCodeFunction]);

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "qrCode" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Bar code"
        description="Add Bar Code to your credential"
      />
      <ScrollArea>
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
          >
            <FormField
              control={form.control}
              name="barCodeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bar code type</FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full rounded-lg text-sm font-medium bg-transparent">
                          <SelectValue placeholder={"Select type"} />
                        </SelectTrigger>
                        <SelectContent className="z-[1001]">
                          {barCodeTypes
                            .filter((type) => type.regex.test(text))
                            .map((type) => (
                              <SelectItem value={type.value} key={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label>Bar code type</Label>
              <div className="relative w-full">
                <Select
                  onValueChange={(value) =>
                    setBarCodeFunction(
                      value as "verify" | "attribute" | "custom"
                    )
                  }
                  value={barCodeFunction}
                >
                  <SelectTrigger className="w-full rounded-lg text-sm font-medium bg-transparent">
                    <SelectValue placeholder={"Select function"} />
                  </SelectTrigger>
                  <SelectContent className="z-[1001]">
                    <SelectItem value={"verify"}>Verify Credentials</SelectItem>
                    <SelectItem value={"attribute"}>Attribute</SelectItem>
                    <SelectItem value={"custom"}>Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {barCodeFunction === "custom" && (
              <FormField
                name={"text" as const}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">Text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="enter text"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <Accordion type="multiple">
              <AccordionItem value="bg-color">
                <AccordionTrigger>Background color</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="bgcolor"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker
                            value={field.value as string}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="color">
                <AccordionTrigger>Color</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ColorPicker
                            value={field.value as string}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button
              disabled={isMutating || creditsIsLoading}
              type="submit"
              className="w-full"
            >
              Generate
              {/* {hasQRCode ? "QR Code already generated" : "Generate"} */}
            </Button>
          </form>
        </Form>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
