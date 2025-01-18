import { cn } from "@/lib/utils";
import React from "react";

const GradientText = ({
  children,
  className,
  Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  Tag: React.ElementType;
}) => {
  return (
    <Tag
      className={cn(
        "bg-gradient-to-r from-[#001FCC] to-[#9D00FF] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </Tag>
  );
};

export default GradientText;
