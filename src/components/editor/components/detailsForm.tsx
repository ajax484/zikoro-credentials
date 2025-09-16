import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import COLORTAG from "@/utils/colorTag";
import { Button } from "@/components/ui/button";
import TextEditor from "@/components/textEditor/Editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paperSeries, paperSizes } from "./settings-sidebar";
import { convertFromPixels, convertToPixels } from "@/utils/helpers";
import { Editor } from "../types";
import { ArrowUpDownIcon } from "lucide-react";
import CustomInput from "@/components/CustomInput";
import { Calendar } from "@phosphor-icons/react";
import { format } from "date-fns";

interface DetailsFormProps {
  onChangeSettings: (settings: any) => void;
  settings: any;
  saveSettings: () => void;
  isSaving: boolean;
  editor: Editor | undefined;
}

const DetailsForm: React.FC<DetailsFormProps> = ({
  onChangeSettings,
  settings,
  saveSettings,
  isSaving,
  editor,
}) => {
  console.log(settings);
  const [skills, setSkills] = useState<{ value: string; color: string }[]>(
    settings.skills
  );
  const [issueDate, setIssueDate] = useState<Date | null>(settings.issueDate);
  const [expiryDate, setExpiryDate] = useState<Date | null>(
    settings.expiryDate
  );
  console.log(settings.expiryDate, settings.issueDate);
  const [cpdPoints, setCpdPoints] = useState<number>(settings.cpdPoints);
  const [cpdHours, setCpdHours] = useState<number>(settings.cpdHours);

  const [newSkill, setNewSkill] = useState<string>("");
  const [color, setColor] = useState<string>("");

  console.log(isSaving);

  const UnitSwitcher = () => (
    <div className="flex flex-col gap-2 w-full">
      <label className="font-medium text-gray-700">Unit</label>
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

  const workspace = editor?.getWorkspace();
  const [unit, setUnit] = useState<"px" | "in" | "cm">(settings?.unit ?? "px");

  // Initialize with pixel values from workspace
  const initialWidth = useMemo(() => workspace?.width ?? 0, [workspace]);
  const initialHeight = useMemo(() => workspace?.height ?? 0, [workspace]);

  const [sizing, setSizing] = useState(settings?.sizing ?? "custom");
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

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

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-2 w-full">
        <label className="font-medium text-gray-700">
          Certificate Description:
        </label>
        <TextEditor
          value={settings.description}
          onChangeContent={(description) => onChangeSettings({ description })}
        />
      </div>
      <div className="space-y-4 p-4">
        {/* <div className="flex flex-col gap-2 w-full">
          <label className="font-medium text-gray-700">Paper Sizes</label>
          <Select
            value={sizing}
            onValueChange={(value) => {
              const paperSize = paperSizes.find(
                (size) => size.sizing === value
              );
              if (!paperSize) return;
              const { height, width, sizing } = paperSize;
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
                          value={sizing}
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
        </div> */}

        {/* issue date */}
        <div>
          <CustomInput
            label="Issue Date"
            append={<Calendar size={16} weight="bold" />}
          >
            <Input
              type="date"
              value={issueDate ? format(issueDate, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                setIssueDate(new Date(e.target.value));
                onChangeSettings({
                  issueDate: new Date(e.target.value),
                });
              }}
              className="!border-none !shadow-none placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
            />
          </CustomInput>
        </div>

        {/* expiry date */}
        <div>
          <CustomInput
            label="Expiry Date"
            append={<Calendar size={16} weight="bold" />}
          >
            <Input
              type="date"
              value={expiryDate ? format(expiryDate, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                setExpiryDate(new Date(e.target.value));
                onChangeSettings({
                  expiryDate: new Date(e.target.value),
                });
              }}
              className="!border-none !shadow-none placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
            />
          </CustomInput>
        </div>

        {/* cpd points */}
        <div>
          <CustomInput label="CPD Points">
            <Input
              type="number"
              value={cpdPoints}
              onChange={(e) => {
                setCpdPoints(parseInt(e.target.value));
                onChangeSettings({
                  cpdPoints: parseInt(e.target.value),
                });
              }}
              className="!border-none !shadow-none placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
            />
          </CustomInput>
        </div>

        {/* cpd hours */}
        <div>
          <CustomInput label="CPD Hours">
            <Input
              type="number"
              value={cpdHours}
              onChange={(e) => {
                setCpdHours(parseInt(e.target.value));
                onChangeSettings({
                  cpdHours: parseInt(e.target.value),
                });
              }}
              className="!border-none !shadow-none placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
            />
          </CustomInput>
        </div>

        {/* <UnitSwitcher />

        {/* Height Input */}
        {/* <CustomInput label="Height">
          <Input
            value={convertFromPixels(height, unit)}
            onChange={(e) => handleDimensionChange("height", e.target.value)}
            type="number"
            className="!border-none !shadow-none placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
          />
        </CustomInput> */}

        {/* Swap Button */}
        {/* <div className="flex items-center justify-center">
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
        </div> */}

        {/* <CustomInput label="Width">
          <Input
            value={convertFromPixels(width, unit)}
            onChange={(e) => handleDimensionChange("width", e.target.value)}
            type="number"
            className="!border-none !shadow-none placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
          />
        </CustomInput>  */}
      </div>
      <div className="flex flex-col gap-2 w-full">
        <label className="font-medium text-gray-700">Skills:</label>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="border-basePrimary border-2 text-basePrimary bg-transparent flex gap-2 hover:bg-basePrimary/20">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth={0}
                viewBox="0 0 1024 1024"
                height="1.5em"
                width="1.5em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M696 480H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
              </svg>
              <span>Earned Skills</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="px-3">
            <DialogHeader>
              <DialogTitle>
                <span className="capitalize">Add Skills</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative py-4">
                <span className="text-tiny text-gray-500 font-medium absolute top-2 left-2">
                  skill
                </span>
                <Input
                  type="text"
                  className="placeholder:text-sm placeholder:text-gray-200 text-gray-700 focus-visible:ring-0"
                  value={newSkill}
                  onInput={(e) => setNewSkill(e.currentTarget.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {COLORTAG.map((colorValue) => (
                  <button
                    aria-label="delete"
                    className={`
              h-8 w-8 rounded-full
              ${color === colorValue ? "opacity-100" : "opacity-25"}
              `}
                    style={{ backgroundColor: colorValue }}
                    key={colorValue}
                    onClick={() => setColor(colorValue)}
                  />
                ))}
              </div>
            </div>
            <DialogClose asChild>
              <Button
                disabled={
                  !newSkill ||
                  !color ||
                  skills.some(({ value }) => newSkill === value)
                }
                onClick={() => {
                  const newSkills = [...skills, { value: newSkill, color }];
                  setSkills(newSkills);
                  setNewSkill("");
                  setColor("");
                  onChangeSettings({ skills: newSkills });
                }}
                className="bg-basePrimary"
              >
                Add Skill
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        <div className="flex flex-wrap justify-start gap-2">
          {skills.map(({ value, color }) => (
            <div
              className="relative text-sm flex items-center gap-1.5 p-2 rounded w-fit"
              style={{
                backgroundColor: color + "22",
                color: color,
                borderWidth: "2px",
                borderColor:
                  skills && skills.includes({ value, color })
                    ? color
                    : color + "22",
              }}
            >
              <button
                onClick={() => {
                  const newSkills = skills.filter(
                    (skill) => skill.value !== value
                  );
                  setSkills(newSkills);
                }}
                style={{
                  backgroundColor: color + "55",
                  color: color,
                }}
                className="bg-white h-4 w-4 flex items-center justify-center text-[8px] absolute -right-2 -top-2 rounded-full"
              >
                x
              </button>
              <span className="font-medium capitalize">{value}</span>
            </div>
          ))}
        </div>
      </div>
      {/* <div className="flex flex-col gap-2 w-full">
        <label className="font-medium text-gray-700">Expiry Date:</label>
        <Input
          placeholder="Enter expiry date"
          type="datetime-local"
          defaultValue={settings.expiryDate}
          value={settings.expiryDate}
          className="placeholder:text-sm h-12 inline-block focus:border-gray-500 placeholder:text-gray-200 text-gray-700 accent-basePrimary bg-basePrimary/10"
          onInput={(e) =>
            onChangeSettings({ expiryDate: e.currentTarget.value })
          }
        />
      </div> */}
      <Button onClick={saveSettings} className="w-full" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};

export default DetailsForm;
