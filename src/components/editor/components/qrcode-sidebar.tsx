import { ActiveTool, COLORS, Editor } from "@/components/editor/types";
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
import { ChromePicker, CirclePicker } from "react-color";
import { rgbaObjectToString } from "../utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkerboard, CubeTransparent, Palette } from "@phosphor-icons/react";
import { rgbaToHex } from "@/utils/helpers";

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
  attributes: string[];
}

export const barCodeTypeEnum = z.enum([
  "CODE128",
  "CODE128A",
  "CODE128B",
  "CODE128C",
  "EAN13",
  "EAN8",
  "UPC",
  "CODE39",
  "ITF14",
  "MSI",
  "MSI10",
  "MSI11",
  "MSI1010",
  "MSI1110",
  "pharmacode",
  "codabar",
  "qr",
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
    label: "QR Code",
    value: "qr",
    regex: /^.{1,65535}$/,
  },
  {
    label: "CODE128",
    value: "CODE128",
    regex: /^[\x00-\x7F]+$/, // Full ASCII
  },
  {
    label: "CODE128A",
    value: "CODE128A",
    regex: /^[\x00-\x5F]+$/, // ASCII 0–95 (uppercase, control)
  },
  {
    label: "CODE128B",
    value: "CODE128B",
    regex: /^[\x20-\x7F]+$/, // ASCII 32–127 (upper/lowercase, numbers, symbols)
  },
  {
    label: "CODE128C",
    value: "CODE128C",
    regex: /^\d+$/, // Digits only, even number of digits
  },
  {
    label: "EAN13",
    value: "EAN13",
    regex: /^\d{12,13}$/, // 12 or 13 digits
  },
  {
    label: "EAN8",
    value: "EAN8",
    regex: /^\d{7,8}$/, // 7 or 8 digits
  },
  {
    label: "UPC",
    value: "UPC",
    regex: /^\d{12}$/, // 12 digits
  },
  {
    label: "CODE39",
    value: "CODE39",
    regex: /^[0-9A-Z \-.$/+%]*$/, // A–Z, 0–9, and some symbols
  },
  {
    label: "ITF14",
    value: "ITF14",
    regex: /^\d{14}$/, // 14 digits
  },
  {
    label: "MSI",
    value: "MSI",
    regex: /^\d+$/, // Digits only
  },
  {
    label: "MSI10",
    value: "MSI10",
    regex: /^\d+$/, // Digits only
  },
  {
    label: "MSI11",
    value: "MSI11",
    regex: /^\d+$/, // Digits only
  },
  {
    label: "MSI1010",
    value: "MSI1010",
    regex: /^\d+$/, // Digits only
  },
  {
    label: "MSI1110",
    value: "MSI1110",
    regex: /^\d+$/, // Digits only
  },
  {
    label: "Pharmacode",
    value: "pharmacode",
    regex: /^\d+$/, // Digits only
  },
  {
    label: "Codabar",
    value: "codabar",
    regex: /^[A-D][0-9\-\$:/.+]+[A-D]$/, // Starts and ends with A-D
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
  attributes,
}: QRCodeSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const { user } = useUserStore();

  const [barCodeFunction, setBarCodeFunction] = useState<
    "verify" | "attribute" | "custom"
  >("verify");

  const [textType, setTextType] = useState<"text" | "number">("text");

  const form = useForm<z.infer<typeof QRCodeSchema>>({
    resolver: zodResolver(QRCodeSchema),
    defaultValues: {
      text: "https://credentials.zikoro.com/credentials/verify/certificate/#{certificateId#}",
      color: "rgba(0, 0, 0, 1)",
      bgcolor: "rgba(255, 255, 255, 1)",
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
      editor?.addQRCode(
        data.text,
        data.color,
        data.bgcolor,
        data.barCodeType,
        barCodeFunction
      );
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

  const [inputType, setInputType] = useState<"text" | "number">("text");

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
            <div className="flex justify-center items-center">
              {["text", "number"].map((type, index) => (
                <button
                  key={index}
                  className={cn(
                    `w-fit py-2 px-6 text-center border border-basePrimary text-sm`,
                    inputType === type
                      ? "text-white bg-basePrimary"
                      : "text-basePrimary bg-transparent"
                  )}
                  onClick={() => setInputType(type as "text" | "number")}
                  disabled={barCodeFunction !== "custom"}
                >
                  {type}
                </button>
              ))}
            </div>

            <FormField
              name={"text" as const}
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-gray-700">Text</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={inputType === "text" ? "enter text" : ""}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      type={inputType}
                      disabled={barCodeFunction !== "custom"}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                          {barCodeTypes.map((type) => (
                            <SelectItem
                              value={type.value}
                              key={type.value}
                              disabled={!type.regex.test(text)}
                            >
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
              <Label>Bar code function</Label>
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
                    {attributes.length > 0 && (
                      <SelectItem value={"attribute"}>Attribute</SelectItem>
                    )}
                    <SelectItem value={"custom"}>Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {barCodeFunction === "attribute" && (
              <FormField
                name={"text" as const}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-700">Attribute</FormLabel>
                    <FormControl className="relative w-full">
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full rounded-lg text-sm font-medium bg-transparent">
                          <SelectValue placeholder={"Select attribute"} />
                        </SelectTrigger>
                        <SelectContent className="z-[1001]">
                          {attributes.map((attribute) => (
                            <SelectItem
                              value={`#{${attribute}#}`}
                              key={attribute}
                            >
                              {attribute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          <div className="flex flex-wrap gap-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <div className="size-8 bg-white rounded-full flex items-center justify-center border">
                                  <Palette size={28} />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <ChromePicker
                                  color={field.value}
                                  onChange={(color: { hex: any }) => {
                                    field.onChange(color.hex);
                                  }}
                                  className="rounded-lg border"
                                />
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {COLORS.map((color, index) =>
                              color === "transparent" ? (
                                <button
                                  key={color}
                                  aria-label={color}
                                  onClick={() => {
                                    console.log(color);
                                    field.onChange("#ffffff00");
                                  }}
                                  type="button"
                                  className={cn(
                                    "size-8 rounded-full border-gray-200 border-2 hover:border-gray-500 transition-colors duration-200 overflow-hidden",
                                    field.value === "#ffffff00" &&
                                      "border-basePrimary"
                                  )}
                                  style={{ backgroundColor: color }}
                                >
                                  <svg
                                    width={32}
                                    height={32}
                                    viewBox="0 0 32 32"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <defs>
                                      <pattern
                                        id="checker"
                                        width={8}
                                        height={8}
                                        patternUnits="userSpaceOnUse"
                                      >
                                        <rect
                                          width={8}
                                          height={8}
                                          fill="#ccc"
                                        />
                                        <rect
                                          x={0}
                                          y={0}
                                          width={4}
                                          height={4}
                                          fill="#fff"
                                        />
                                        <rect
                                          x={4}
                                          y={4}
                                          width={4}
                                          height={4}
                                          fill="#fff"
                                        />
                                      </pattern>
                                    </defs>
                                    <rect
                                      width={32}
                                      height={32}
                                      fill="url(#checker)"
                                    />
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  key={color}
                                  aria-label={color}
                                  onClick={() => {
                                    console.log(color);
                                    field.onChange(color);
                                  }}
                                  type="button"
                                  className={cn(
                                    "size-8 rounded-full border-gray-200 border-2 hover:border-gray-500 transition-colors duration-200",
                                    field.value === color &&
                                      "border-basePrimary"
                                  )}
                                  style={{ backgroundColor: color }}
                                />
                              )
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="color">
                <AccordionTrigger>Foreground Color</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-wrap gap-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <div className="size-8 bg-white rounded-full flex items-center justify-center border">
                                  <Palette size={28} />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <ChromePicker
                                  color={field.value}
                                  onChange={(color: { hex: any }) => {
                                    field.onChange(color.hex);
                                  }}
                                  className="rounded-lg border"
                                />
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {COLORS.map((color, index) =>
                              color === "transparent" ? (
                                <button
                                  key={color}
                                  aria-label={color}
                                  onClick={() => {
                                    console.log(color);
                                    field.onChange("#ffffff00");
                                  }}
                                  type="button"
                                  className={cn(
                                    "size-8 rounded-full border-gray-200 border-2 hover:border-gray-500 transition-colors duration-200 overflow-hidden",
                                    field.value === "#ffffff00" &&
                                      "border-basePrimary"
                                  )}
                                  style={{ backgroundColor: color }}
                                >
                                  <svg
                                    width={32}
                                    height={32}
                                    viewBox="0 0 32 32"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <defs>
                                      <pattern
                                        id="checker"
                                        width={8}
                                        height={8}
                                        patternUnits="userSpaceOnUse"
                                      >
                                        <rect
                                          width={8}
                                          height={8}
                                          fill="#ccc"
                                        />
                                        <rect
                                          x={0}
                                          y={0}
                                          width={4}
                                          height={4}
                                          fill="#fff"
                                        />
                                        <rect
                                          x={4}
                                          y={4}
                                          width={4}
                                          height={4}
                                          fill="#fff"
                                        />
                                      </pattern>
                                    </defs>
                                    <rect
                                      width={32}
                                      height={32}
                                      fill="url(#checker)"
                                    />
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  key={color}
                                  aria-label={color}
                                  onClick={() => {
                                    console.log(color);
                                    field.onChange(color);
                                  }}
                                  type="button"
                                  className={cn(
                                    "size-8 rounded-full border-gray-200 border-2 hover:border-gray-500 transition-colors duration-200",
                                    field.value === color &&
                                      "border-basePrimary"
                                  )}
                                  style={{ backgroundColor: color }}
                                />
                              )
                            )}
                          </div>
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
