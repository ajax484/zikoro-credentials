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

const paperSizes = [
  {
    series: "ISO B Series",
    sizes: [
      { height: 141.4, width: 100.0, label: "B0", value: "b0" },
      { height: 100.0, width: 70.7, label: "B1", value: "b1" },
      { height: 70.7, width: 50.0, label: "B2", value: "b2" },
      { height: 50.0, width: 35.3, label: "B3", value: "b3" },
      { height: 35.3, width: 25.0, label: "B4", value: "b4" },
      { height: 25.0, width: 17.6, label: "B5", value: "b5" },
      { height: 17.6, width: 12.5, label: "B6", value: "b6" },
      { height: 12.5, width: 8.8, label: "B7", value: "b7" },
      { height: 8.8, width: 6.2, label: "B8", value: "b8" },
      { height: 6.2, width: 4.4, label: "B9", value: "b9" },
      { height: 4.4, width: 3.1, label: "B10", value: "b10" },
    ],
  },
  {
    series: "ISO A Series",
    sizes: [
      { height: 118.9, width: 84.1, label: "A0", value: "a0" },
      { height: 84.1, width: 59.4, label: "A1", value: "a1" },
      { height: 59.4, width: 42.0, label: "A2", value: "a2" },
      { height: 42.0, width: 29.7, label: "A3", value: "a3" },
      { height: 29.7, width: 21.0, label: "A4", value: "a4" },
      { height: 21.0, width: 14.8, label: "A5", value: "a5" },
      { height: 14.8, width: 10.5, label: "A6", value: "a6" },
      { height: 10.5, width: 7.4, label: "A7", value: "a7" },
      { height: 7.4, width: 5.2, label: "A8", value: "a8" },
      { height: 5.2, width: 3.7, label: "A9", value: "a9" },
      { height: 3.7, width: 2.6, label: "A10", value: "a10" },
    ],
  },
  {
    series: "North American",
    sizes: [
      { height: 43.2, width: 27.9, label: "Ledger", value: "ledger" },
      { height: 43.2, width: 27.9, label: "Tabloid", value: "tabloid" },
      { height: 35.6, width: 21.6, label: "Legal", value: "legal" },
      { height: 27.9, width: 21.6, label: "Letter", value: "letter" },
      { height: 26.7, width: 18.4, label: "Executive", value: "executive" },
    ],
  },
  {
    series: "Large Format",
    sizes: [
      { height: 91.4, width: 66.0, label: "A1+", value: "a1_plus" },
      { height: 60.9, width: 45.7, label: "A2+", value: "a2_plus" },
      { height: 48.3, width: 32.9, label: "A3+", value: "a3_plus" },
    ],
  },
  {
    series: "custom",
    sizes: [{ height: 100, width: 100, label: "Custom", value: "custom" }],
  },
];

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

  const [sizing, setSizing] = useState("custom");
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
          <div className="relative border">
            <Label className="absolute top-0 -translate-y-1/2 right-4 bg-white text-gray-600 text-tiny px-1">
              Paper Sizes
            </Label>
            <Select
              value={`${height},${width},${sizing}`}
              onValueChange={(value) => {
                const [height, width, sizing] = value.split(",");
                const heightInPixels = convertToPixels(Number(height), "cm");
                const widthInPixels = convertToPixels(Number(width), "cm");
                setHeight(heightInPixels);
                setWidth(widthInPixels);
                editor?.changeSize({
                  width: widthInPixels,
                  height: heightInPixels,
                });
                setSizing(sizing);
              }}
            >
              <SelectTrigger className="w-full rounded-lg text-sm font-medium bg-transparent">
                <SelectValue placeholder="Select paper size" />
              </SelectTrigger>
              <SelectContent className="z-[1001]">
                {/* Grouped Paper Sizes */}
                {paperSizes.map((seriesGroup) => (
                  <SelectGroup key={seriesGroup.series}>
                    <SelectLabel>{seriesGroup.series}</SelectLabel>
                    {seriesGroup.sizes.map(
                      ({ height, width, label, value }) => (
                        <SelectItem
                          key={value}
                          value={`${height},${width},${value}`}
                        >
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <UnitSwitcher />

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
