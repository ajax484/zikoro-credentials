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
    <div className="rounded-lg">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full rounded-lg bg-white text-xs font-medium">
          <SelectValue placeholder={placeholder} />
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
