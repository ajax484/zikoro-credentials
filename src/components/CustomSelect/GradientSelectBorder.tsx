import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface GradientBorderSelectProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

const GradientBorderSelect = ({
  placeholder,
  value,
  onChange,
  options,
}: GradientBorderSelectProps) => {
  return (
    <div className="p-[3px] [background:_linear-gradient(90deg,_#001FCC_0%,_#9D00FF_100%);] rounded-md">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full rounded-md bg-white text-xs font-medium">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem value={option.value} key={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default GradientBorderSelect;
