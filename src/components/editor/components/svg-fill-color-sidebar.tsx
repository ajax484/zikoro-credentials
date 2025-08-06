import {
  ActiveTool,
  COLORS,
  Editor,
  FILL_COLOR,
} from "@/components/editor/types";
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
import { useState } from "react";

interface SVGFillColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const SVGFillColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: SVGFillColorSidebarProps) => {
  const selectedSVG = editor?.getActiveObject() as fabric.Group;
  const [currentChild, setCurrentChild] = useState<fabric.Object | null>(null);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChange = (value: string) => {
    currentChild && editor?.changeFillColor(value, currentChild);
  };

  if (!selectedSVG || selectedSVG.type !== "group" || !selectedSVG?.isSVG)
    return null;

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "svg-fill" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="SVG Fill color"
        description="Manipulate the fill color of your SVG"
      />
      <ScrollArea>
        <div className="space-y-8 p-4">
          <div className="flex gap-4 items-center">
            {selectedSVG.getObjects().map((child) => {
              const fill = child.get("fill") as string;

              return (
                <button
                  onClick={() => {
                    setCurrentChild(child);
                  }}
                  type="button"
                  className={cn(
                    "rounded-sm size-10 border-2",
                    currentChild === child && "border-basePrimary"
                  )}
                  style={{
                    backgroundColor: fill,
                  }}
                />
              );
            })}
          </div>
          {currentChild && (
            <div className="flex flex-wrap gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="size-8 bg-white rounded-full flex items-center justify-center border">
                    <Palette size={28} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <ChromePicker
                    color={currentChild.get("fill")}
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
                      currentChild.get("fill") === "#ffffff00" &&
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
                      currentChild.get("fill") === color && "border-basePrimary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
