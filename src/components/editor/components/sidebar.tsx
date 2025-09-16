"use client";
import { ActiveTool } from "@/components/editor/types";
import { SidebarItem } from "@/components/editor/components/sidebar-item";
import { PiSelectionBackground } from "react-icons/pi";
import {
  Barcode,
  Image,
  Layout,
  Lock,
  QrCode,
  SelectionBackground,
  Shapes,
  Signature,
  SlidersHorizontal,
  Stack,
  TextT,
} from "@phosphor-icons/react";

interface SidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const Sidebar = ({ activeTool, onChangeActiveTool }: SidebarProps) => {
  return (
    <aside className="flex h-full w-[100px] flex-col overflow-y-auto border-r bg-white hide-scrollbar">
      <ul className="flex flex-col">
        <SidebarItem
          icon={Layout}
          label="Templates"
          isActive={activeTool === "templates"}
          onClick={() => onChangeActiveTool("templates")}
          numKey={"1"}
        />
        <SidebarItem
          icon={SelectionBackground}
          label="Background"
          isActive={activeTool === "background"}
          onClick={() => onChangeActiveTool("background")}
          numKey={"2"}
        />
        <SidebarItem
          icon={Image}
          label="Image"
          isActive={activeTool === "images"}
          onClick={() => onChangeActiveTool("images")}
          numKey={"3"}
        />
        <SidebarItem
          icon={TextT}
          label="Text"
          isActive={activeTool === "text"}
          onClick={() => onChangeActiveTool("text")}
          numKey={"4"}
        />
        <SidebarItem
          icon={QrCode}
          label="Bar Code"
          isActive={activeTool === "qrCode"}
          onClick={() => onChangeActiveTool("qrCode")}
          numKey={"5"}
        />
        <SidebarItem
          icon={Lock}
          label="Attributes"
          isActive={activeTool === "verification"}
          onClick={() => onChangeActiveTool("verification")}
          numKey={"6"}
        />
        <SidebarItem
          icon={Shapes}
          label="Elements"
          isActive={activeTool === "shapes"}
          onClick={() => onChangeActiveTool("shapes")}
          numKey={"7"}
        />
        <SidebarItem
          icon={Signature}
          label="Signature"
          isActive={activeTool === "draw"}
          onClick={() => onChangeActiveTool("draw")}
          numKey={"8"}
        />
        {/* <SidebarItem
          icon={Sparkles}
          label="AI"
          isActive={activeTool === "ai"}
          onClick={() => onChangeActiveTool("ai")}
        /> */}
        <SidebarItem
          icon={Stack}
          label="Layers"
          isActive={activeTool === "layers"}
          onClick={() => onChangeActiveTool("layers")}
          numKey={"9"}
        />
        <SidebarItem
          icon={SlidersHorizontal}
          label="Canvas"
          isActive={activeTool === "canvas"}
          onClick={() => onChangeActiveTool("canvas")}
          numKey={"0"}
        />
      </ul>
    </aside>
  );
};
