import {
  ActiveTool,
  BORDER_RADIUS,
  Editor,
  STROKE_DASH_ARRAY,
  STROKE_WIDTH,
} from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { on } from "events";

interface BorderRadiusSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const BorderRadiusSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: BorderRadiusSidebarProps) => {
  const borderRadiusValue = editor?.getActiveBorderRadius() || BORDER_RADIUS;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChangeBorderRadius = (value: number) => {
    editor?.changeBorderRadius(value);
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "border-radius" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Border radius options"
        description="Modify the border radius of your element"
      />
      <ScrollArea>
        <div className="space-y-4 border-b p-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Border radius</Label>
            <Input
              onInput={(e) =>
                onChangeBorderRadius(Number(e.currentTarget.value))
              }
              value={borderRadiusValue}
              type="number"
              min={10}
            />
          </div>
          <Slider
            value={[borderRadiusValue]}
            onValueChange={(values) => onChangeBorderRadius(values[0])}
            min={0}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
