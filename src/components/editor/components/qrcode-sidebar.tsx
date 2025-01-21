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
});

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

  const form = useForm<z.infer<typeof QRCodeSchema>>({
    resolver: zodResolver(QRCodeSchema),
    defaultValues: {
      text: "https://www.credentials.zikoro.com/credentials/verify/certificate/#{certificateId#}",
      color: "#000000",
      bgcolor: "#ffffff",
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
      editor?.addQRCode(data.text, data.color, data.bgcolor);
      toggleQRCode(true);
    } catch (error) {
      toast.error("Failed to charge QR Code.");
    }
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "qrCode" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="QR Code"
        description="Add QR Code to your credential"
      />
      <ScrollArea>
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
          >
            <div>
              <FormField
                control={form.control}
                name="bgcolor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
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
            </div>
            <div>
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
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
            </div>
            <Button
              disabled={isMutating || creditsIsLoading || hasQRCode}
              type="submit"
              className="w-full"
            >
              {hasQRCode ? "QR Code already generated" : "Generate"}
            </Button>
          </form>
        </Form>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
