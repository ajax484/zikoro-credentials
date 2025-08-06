import { ActiveTool, COLORS, Editor, FILL_COLOR } from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";
import { ChromePicker, CirclePicker } from "react-color";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkerboard, CubeTransparent, Palette } from "@phosphor-icons/react";

interface FillColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const FillColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FillColorSidebarProps) => {
  const value = editor?.getActiveFillColor() || FILL_COLOR;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChange = (value: string) => {
    editor?.changeFillColor(value);
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "fill" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Fill color"
        description="Add fill color to your element"
      />
      <ScrollArea>
        <div className="flex flex-wrap gap-4 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="size-8 bg-white rounded-full flex items-center justify-center border">
                <Palette size={28} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <ChromePicker
                color={value}
                onChange={(color: { hex: any }) => {
                  onChange(color.hex);
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
                  onChange("#ffffff00");
                }}
                type="button"
                className={cn(
                  "size-8 rounded-full border-gray-200 border-2 hover:border-gray-500 transition-colors duration-200 overflow-hidden",
                  value === "#ffffff00" && "border-basePrimary"
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
                      <rect width={8} height={8} fill="#ccc" />
                      <rect x={0} y={0} width={4} height={4} fill="#fff" />
                      <rect x={4} y={4} width={4} height={4} fill="#fff" />
                    </pattern>
                  </defs>
                  <rect width={32} height={32} fill="url(#checker)" />
                </svg>
              </button>
            ) : (
              <button
                key={color}
                aria-label={color}
                onClick={() => {
                  console.log(color);
                  onChange(color);
                }}
                type="button"
                className={cn(
                  "size-8 rounded-full border-gray-200 border-2 hover:border-gray-500 transition-colors duration-200",
                  value === color && "border-basePrimary"
                )}
                style={{ backgroundColor: color }}
              />
            )
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
