import { ChromePicker, CirclePicker } from "react-color";

import { COLORS } from "@/components/editor/types";
import { rgbaObjectToString } from "@/components/editor/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  disableTransparent?: boolean;
}

export const ColorPicker = ({
  value,
  onChange,
  disableTransparent = false,
}: ColorPickerProps) => {
  return (
    <div className="w-full gap-y-4 flex flex-col items-center">
      <ChromePicker
        color={value}
        onChange={(color: { rgb: any }) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
        className="rounded-lg border"
      />
      <CirclePicker
        color={value}
        colors={
          disableTransparent
            ? COLORS.filter((color) => color !== "transparent")
            : COLORS
        }
        onChangeComplete={(color: { rgb: any }) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
      />
    </div>
  );
};
