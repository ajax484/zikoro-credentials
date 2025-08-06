import Select from "react-select";

interface GradientBorderSelectProps {
  isMulti?: boolean;
  onChange: (value: string | string[]) => void;
  options: { label: string; value: string }[];
  defaultValue?: string | string[];
  placeholder?: string;
}

export default function GradientBorderSelect({
  isMulti,
  onChange,
  options,
  defaultValue,
  placeholder,
}: GradientBorderSelectProps) {
  return (
    <Select
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          // borderColor: state?.isFocused
          //   ?"#818cf8"
          //   :  "#818cf8",
          // "&:hover": {
          //   borderColor: borderColor || "#6b7280",
          // },
          height: "100%",
          minHeight: baseStyles.minHeight,
          // backgroundColor: bgColor || "#ffffff",
          boxShadow: "0px",
          borderRadius: "6px",
          backgroundImage:
            "linear-gradient(to right, #001FCC19 0%, #9D00FF19 100%)",
          border: "0px",
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          textAlign: "start",
          color: state?.isSelected ? "black" : "black",
          backgroundColor: state?.isFocused ? "#e2e8f0" : "",
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          textAlign: "start",
          textDecoration: "capitalize",
          fontSize: "13px",
          padding: "4px",
        }),
        placeholder: (baseStyles) => ({
          ...baseStyles,
          textAlign: "start",
          color: "#6b7280",
          fontSize: "13px",
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          borderRadius: "6px",
          zIndex: 100,
          fontSize: "13px",
        }),
        dropdownIndicator: (baseStyle) => ({
          ...baseStyle,
          borderRight: "0px",
        }),
        indicatorSeparator: (baseStyle) => ({ ...baseStyle, width: "0px" }),
        container: (baseStyle) => ({
          ...baseStyle,
          height: baseStyle.height,
        }),
      }}
      onChange={(newValue) => {
        console.log(newValue);
        // react-select returns an option or array of options, so map to string(s)
        if (Array.isArray(newValue)) {
          onChange(newValue.map((option) => option.value));
        } else if (
          newValue &&
          typeof newValue === "object" &&
          "value" in newValue
        ) {
          onChange(newValue.value as string);
        } else {
          onChange("");
        }
      }}
      isMulti={isMulti}
      name="category"
      options={options}
      borderColor="#001fcc"
      bgColor="#001fcc1a"
      height="2.5rem"
      placeHolderColor="#64748b"
      placeHolder={placeholder || "Select..."}
      defaultValue={defaultValue}
    />
  );
}
