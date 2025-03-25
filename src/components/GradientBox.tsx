import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

const boxVariants = cva("bg-gradient-to-r from-[#001FCC] to-[#9D00FF] p-0.5", {
  variants: {
    rounded: {
      true: "rounded-full",
      false: "rounded-none",
    },
  },
  defaultVariants: {
    rounded: true,
  },
});

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {}

const GradientBox: React.FC<BoxProps> = ({ children, rounded, ...props }) => {
  return (
    <div className={cn(boxVariants({ rounded }), props.className)} {...props}>
      <div className="bg-white">{children}</div>
    </div>
  );
};

export default GradientBox;
