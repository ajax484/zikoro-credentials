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
import { convertFromPixels, convertToPixels } from "@/utils/helpers";
import { se } from "date-fns/locale";

export const paperSeries: string[] = [
  "iso b series",
  "iso a series",
  "north american",
  "large format",
  "label",
  "custom",
];

export const paperSizes = [
  {
    height: 141.4,
    width: 100.0,
    label: "B0",
    sizing: "b0",
    series: "iso b series",
  },
  {
    height: 100.0,
    width: 70.7,
    label: "B1",
    sizing: "b1",
    series: "iso b series",
  },
  {
    height: 70.7,
    width: 50.0,
    label: "B2",
    sizing: "b2",
    series: "iso b series",
  },
  {
    height: 50.0,
    width: 35.3,
    label: "B3",
    sizing: "b3",
    series: "iso b series",
  },
  {
    height: 35.3,
    width: 25.0,
    label: "B4",
    sizing: "b4",
    series: "iso b series",
  },
  {
    height: 25.0,
    width: 17.6,
    label: "B5",
    sizing: "b5",
    series: "iso b series",
  },
  {
    height: 17.6,
    width: 12.5,
    label: "B6",
    sizing: "b6",
    series: "iso b series",
  },
  {
    height: 12.5,
    width: 8.8,
    label: "B7",
    sizing: "b7",
    series: "iso b series",
  },
  {
    height: 8.8,
    width: 6.2,
    label: "B8",
    sizing: "b8",
    series: "iso b series",
  },
  {
    height: 6.2,
    width: 4.4,
    label: "B9",
    sizing: "b9",
    series: "iso b series",
  },
  {
    height: 4.4,
    width: 3.1,
    label: "B10",
    sizing: "b10",
    series: "iso b series",
  },

  {
    height: 118.9,
    width: 84.1,
    label: "A0",
    sizing: "a0",
    series: "iso a series",
  },
  {
    height: 84.1,
    width: 59.4,
    label: "A1",
    sizing: "a1",
    series: "iso a series",
  },
  {
    height: 59.4,
    width: 42.0,
    label: "A2",
    sizing: "a2",
    series: "iso a series",
  },
  {
    height: 42.0,
    width: 29.7,
    label: "A3",
    sizing: "a3",
    series: "iso a series",
  },
  {
    height: 29.7,
    width: 21.0,
    label: "A4",
    sizing: "a4",
    series: "iso a series",
  },
  {
    height: 21.0,
    width: 14.8,
    label: "A5",
    sizing: "a5",
    series: "iso a series",
  },
  {
    height: 14.8,
    width: 10.5,
    label: "A6",
    sizing: "a6",
    series: "iso a series",
  },
  {
    height: 10.5,
    width: 7.4,
    label: "A7",
    sizing: "a7",
    series: "iso a series",
  },
  {
    height: 7.4,
    width: 5.2,
    label: "A8",
    sizing: "a8",
    series: "iso a series",
  },
  {
    height: 5.2,
    width: 3.7,
    label: "A9",
    sizing: "a9",
    series: "iso a series",
  },
  {
    height: 3.7,
    width: 2.6,
    label: "A10",
    sizing: "a10",
    series: "iso a series",
  },

  {
    height: 43.2,
    width: 27.9,
    label: "Ledger",
    sizing: "ledger",
    series: "north american",
  },
  {
    height: 43.2,
    width: 27.9,
    label: "Tabloid",
    sizing: "tabloid",
    series: "north american",
  },
  {
    height: 35.6,
    width: 21.6,
    label: "Legal",
    sizing: "legal",
    series: "north american",
  },
  {
    height: 27.9,
    width: 21.6,
    label: "Letter",
    sizing: "letter",
    series: "north american",
  },
  {
    height: 26.7,
    width: 18.4,
    label: "Executive",
    sizing: "executive",
    series: "north american",
  },

  {
    height: 91.4,
    width: 66.0,
    label: "A1+",
    sizing: "a1_plus",
    series: "large format",
  },
  {
    height: 60.9,
    width: 45.7,
    label: "A2+",
    sizing: "a2_plus",
    series: "large format",
  },
  {
    height: 48.3,
    width: 32.9,
    label: "A3+",
    sizing: "a3_plus",
    series: "large format",
  },
  {
    height: 4.5,
    width: 2.5,
    label: "4.5 x 2.5 cm",
    sizing: "4_5_x_2_5_cm",
    series: "label",
  },
  {
    height: 5,
    width: 4,
    label: "5cm x 4 cm",
    sizing: "5_cm_x_4_cm",
    series: "label",
  },
  {
    height: 5,
    width: 10,
    label: "5cm x 10cm",
    sizing: "5_cm_x_10_cm",
    series: "label",
  },
  {
    height: 10,
    width: 10,
    label: "Label",
    sizing: "10_cm_x_10_cm",
    series: "label",
  },

  {
    height: 100,
    width: 100,
    label: "Custom",
    sizing: "custom",
    series: "custom",
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
  const [unit, setUnit] = useState<"px" | "in" | "cm">(settings?.unit ?? "px");

  // Initialize with pixel values from workspace
  const initialWidth = useMemo(() => workspace?.width ?? 0, [workspace]);
  const initialHeight = useMemo(() => workspace?.height ?? 0, [workspace]);

  const [sizing, setSizing] = useState(settings?.sizing ?? "custom");
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
        onChange={(e) => {
          setUnit(e.currentTarget.value as "px" | "in" | "cm");
          onChangeSettings({
            unit: e.currentTarget.value as "px" | "in" | "cm",
          });
        }}
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
              value={`${convertFromPixels(height, "cm")},${convertFromPixels(
                width,
                "cm"
              )},${sizing}`}
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
                onChangeSettings({ sizing });
              }}
            >
              <SelectTrigger className="w-full rounded-lg text-sm font-medium bg-transparent">
                <SelectValue placeholder="Select paper size" />
              </SelectTrigger>
              <SelectContent className="z-[1001]">
                {paperSeries.map((seriesGroup) => {
                  const sizesInSeries = paperSizes.filter(
                    (size) => size.series === seriesGroup
                  );

                  if (sizesInSeries.length === 0) return null;

                  return (
                    <SelectGroup key={seriesGroup}>
                      <SelectLabel className="capitalize">
                        {seriesGroup}
                      </SelectLabel>
                      {sizesInSeries.map((size) => {
                        const { height, width, label, sizing } = size;

                        return (
                          <SelectItem
                            key={sizing}
                            value={`${height},${width},${sizing}`}
                            data-height={height}
                            data-width={width}
                          >
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  );
                })}
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
