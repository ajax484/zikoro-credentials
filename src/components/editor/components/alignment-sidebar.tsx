import { ActiveTool, Editor, STROKE_COLOR } from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";
import { ColorPicker } from "@/components/editor/components/color-picker";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  Icon,
} from "@phosphor-icons/react";
import { AlignCenter } from "lucide-react";

interface AlignmentSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

interface Alignment {
  name: string;
  icon: Icon;
  topPosition: "start" | "middle" | "end";
  leftPosition: "start" | "middle" | "end";
}

const alignments: Alignment[] = [
  {
    name: "left",
    icon: AlignCenterHorizontal,
    topPosition: "start",
    leftPosition: "start",
  },
  {
    name: "center",
    icon: AlignCenter,
    topPosition: "middle",
    leftPosition: "middle",
  },
  {
    name: "right",
    icon: AlignCenterVertical,
    topPosition: "end",
    leftPosition: "end",
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
                onClick={() =>
                  editor?.changeAlignment(
                    alignment.topPosition,
                    alignment.leftPosition
                  )
                }
                className="border-b px-4 py-2 w-full flex items-center gap-4"
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
