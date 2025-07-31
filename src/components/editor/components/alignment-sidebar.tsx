import { ActiveTool, Editor, STROKE_COLOR } from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";
import { ColorPicker } from "@/components/editor/components/color-picker";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import {
  AlignCenter,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignCenterHorizontal,
  AlignCenterVertical,
} from "lucide-react";

interface AlignmentSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

interface Alignment {
  name: string;
  icon: Icon;
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "middle-left"
    | "middle-center"
    | "middle-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

const alignments: Alignment[] = [
  {
    name: "top left",
    icon: AlignStartHorizontal,
    position: "top-left",
  },
  {
    name: "top center",
    icon: AlignStartVertical,
    position: "top-center",
  },
  {
    name: "top right",
    icon: AlignCenterVertical,
    position: "top-right",
  },
  {
    name: "middle left",
    icon: AlignCenterHorizontal,
    position: "middle-left",
  },
  {
    name: "middle center",
    icon: AlignCenter,
    position: "middle-center",
  },
  {
    name: "middle right",
    icon: AlignCenterVertical,
    position: "middle-right",
  },
  {
    name: "bottom left",
    icon: AlignCenterHorizontal,
    position: "bottom-left",
  },
  {
    name: "bottom center",
    icon: AlignCenter,
    position: "bottom-center",
  },
  {
    name: "bottom right",
    icon: AlignCenterVertical,
    position: "bottom-right",
  },
];

export const AlignmentSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: AlignmentSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "alignment" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Alignment" description="Align your element" />
      <ScrollArea>
        <div className="space-y-6">
          {alignments.map((alignment) => {
            const Icon = alignment.icon;
            return (
              <button
                key={alignment.name}
                onClick={() => editor?.changeAlignment(alignment.position)}
                className="border-b px-4 py-2 w-full flex items-center justify-center gap-4"
              >
                <Icon size={20} />
                <span className="text-lg capitalize font-medium">
                  {alignment.name}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
