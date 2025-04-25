import { useMemo, useState } from "react";

import { ActiveTool, Editor } from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";
import { ColorPicker } from "@/components/editor/components/color-picker";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpDownIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  onChangeSettings: (settings: any) => void;
  settings: any;
  saveSettings: () => void;
  isSaving: boolean;
}

export const SettingsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  onChangeSettings,
  settings,
  saveSettings,
  isSaving,
}: SettingsSidebarProps) => {
  const workspace = editor?.getWorkspace();
  const [unit, setUnit] = useState<"px" | "in" | "cm">("px");
  const dpi = 96; // Default screen DPI

  // Conversion functions
  const convertToPixels = (value: number, unit: string) => {
    switch (unit) {
      case "in":
        return value * dpi;
      case "cm":
        return (value * dpi) / 2.54;
      default:
        return value;
    }
  };

  const convertFromPixels = (pixels: number, unit: string) => {
    switch (unit) {
      case "in":
        return pixels / dpi;
      case "cm":
        return (pixels * 2.54) / dpi;
      default:
        return pixels;
    }
  };

  // Initialize with pixel values from workspace
  const initialWidth = useMemo(() => workspace?.width ?? 0, [workspace]);
  const initialHeight = useMemo(() => workspace?.height ?? 0, [workspace]);

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [background, setBackground] = useState(workspace?.fill ?? "#ffffff");

  // Unit switcher UI
  const UnitSwitcher = () => (
    <div className="relative border mb-4">
      <Label className="absolute top-0 -translate-y-1/2 right-4 bg-white text-gray-600 text-tiny px-1">
        Unit
      </Label>
      <select
        aria-label="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value as "px" | "in" | "cm")}
        className="w-full p-2 border rounded bg-transparent"
      >
        <option value="px">Pixels (px)</option>
        <option value="in">Inches (in)</option>
        <option value="cm">Centimeters (cm)</option>
      </select>
    </div>
  );

  // Modified input handlers
  const handleDimensionChange = (
    dimension: "width" | "height",
    value: string
  ) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return;

    const pixels = convertToPixels(parsed, unit);
    if (dimension === "width") {
      setWidth(pixels);
      editor?.changeSize({ width: pixels, height });
    } else {
      setHeight(pixels);
      editor?.changeSize({ width, height: pixels });
    }
  };

  const changeBackground = (value: string) => {
    setBackground(value);
    editor?.changeBackground(value);
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  console.log(width, height);

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "settings" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Settings"
        description="Change the look of your workspace"
      />
      <ScrollArea>
        <div className="space-y-4 p-4">
          <UnitSwitcher />

          {/* <div className="relative border">
            <Label className="absolute top-0 -translate-y-1/2 right-4 bg-white text-gray-600 text-tiny px-1">
              Dimension
            </Label>
            <Select
              onValueChange={(value) =>
                setBarCodeFunction(value as "verify" | "attribute" | "custom")
              }
              value={barCodeFunction}
            >
              <SelectTrigger className="w-full rounded-lg text-sm font-medium bg-transparent">
                <SelectValue placeholder={"Select function"} />
              </SelectTrigger>
              <SelectContent className="z-[1001]">
                <SelectGroup>
                  <SelectLabel>North America</SelectLabel>
                  <SelectItem value="est">
                    Eastern Standard Time (EST)
                  </SelectItem>
                  <SelectItem value="cst">
                    Central Standard Time (CST)
                  </SelectItem>
                  <SelectItem value="mst">
                    Mountain Standard Time (MST)
                  </SelectItem>
                  <SelectItem value="pst">
                    Pacific Standard Time (PST)
                  </SelectItem>
                  <SelectItem value="akst">
                    Alaska Standard Time (AKST)
                  </SelectItem>
                  <SelectItem value="hst">
                    Hawaii Standard Time (HST)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div> */}

          {/* Height Input */}
          <div className="relative border">
            <Label className="absolute top-0 -translate-y-1/2 right-4 bg-white text-gray-600 text-tiny px-1">
              Height
            </Label>
            <Input
              value={convertFromPixels(height, unit)}
              onChange={(e) => handleDimensionChange("height", e.target.value)}
              type="number"
            />
          </div>

          {/* Swap Button */}
          <button
            aria-label="Swap width and height"
            onClick={() => {
              const newWidth = height;
              const newHeight = width;
              setWidth(newWidth);
              setHeight(newHeight);
              editor?.changeSize({ width: newWidth, height: newHeight });
            }}
          >
            <ArrowUpDownIcon className="w-6 h-6" />
          </button>

          <div className="relative border">
            <Label className="absolute top-0 -translate-y-1/2 right-4 bg-white text-gray-600 text-tiny px-1">
              Width
            </Label>
            <Input
              value={convertFromPixels(width, unit)}
              onChange={(e) => handleDimensionChange("width", e.target.value)}
              type="number"
            />
          </div>
        </div>
        <div className="p-4">
          <ColorPicker
            value={background as string}
            onChange={changeBackground}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
