import Image from "next/image";
import { AlertTriangle, Loader, Crown } from "lucide-react";

// import { usePaywall } from "@/components/subscriptions/hooks/use-paywall";

import { ActiveTool, Editor } from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";

// import {
//   ResponseType,
//   useGetTemplates,
// } from "@/components/projects/api/use-get-templates";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CertificateTemplate } from "@/types/certificates";
import { useGetData } from "@/hooks/services/request";
import { useFetchCertificateTemplates } from "@/queries/certificates.queries";
import { useState } from "react";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  type: string;
}

export const TemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  type,
}: TemplateSidebarProps) => {
  const {
    data: templates,
    isFetching: isLoading,
    error,
  } = useFetchCertificateTemplates();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async (template: CertificateTemplate) => {
    editor?.loadJson(JSON.stringify(template.JSON));
  };

  const [orientation, setOrientation] = useState<
    "landscape" | "portrait" | "default"
  >("portrait");

  const toggleOrientation = (orientation: "landscape" | "portrait") => {
    setOrientation((prev) => (prev === orientation ? "default" : orientation));
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "templates" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Templates"
        description="Choose from a variety of templates to get started"
      />
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <Loader className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}
      {error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-y-4">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Failed to fetch templates
          </p>
        </div>
      )}
      <div className="flex px-4 gap-0.5 items-center">
        <button
          onClick={() => toggleOrientation("portrait")}
          className={cn(
            "w-full border-basePrimary border-2",
            orientation === "portrait"
              ? "text-white bg-basePrimary"
              : "text-basePrimary bg-white"
          )}
        >
          portrait
        </button>
        <button
          onClick={() => toggleOrientation("landscape")}
          className={cn(
            "w-full border-basePrimary border-2",
            orientation === "landscape"
              ? "text-white bg-basePrimary"
              : "text-basePrimary bg-white"
          )}
        >
          landscape
        </button>
      </div>
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {templates &&
              templates
                .filter((template) => template.credentialType === type)
                .filter(
                  (template) =>
                    orientation === "default" ||
                    (orientation === "landscape" &&
                      template.JSON.width > template.JSON.height) ||
                    (orientation === "portrait" &&
                      template.JSON.width < template.JSON.height)
                )
                .map((template) => {
                  return (
                    <button
                      onClick={() => onClick(template)}
                      key={template.id}
                      className="group relative rounded-sm border bg-muted transition hover:opacity-75 h-[200px] w-full overflow-hidden"
                    >
                      <Image
                        fill
                        src={template.previewUrl || ""}
                        alt={template.name || "Template"}
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 w-full truncate bg-black/50 p-1 text-left text-[10px] text-white opacity-0 group-hover:opacity-100">
                        {template.name}
                      </div>
                    </button>
                  );
                })}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
