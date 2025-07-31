import { IoTriangle } from "react-icons/io5";
import { FaDiamond } from "react-icons/fa6";
import {
  FaCircle,
  FaRulerHorizontal,
  FaRulerVertical,
  FaSquare,
  FaSquareFull,
} from "react-icons/fa";

import { ActiveTool, Editor } from "@/components/editor/types";
import { ShapeTool } from "@/components/editor/components/shape-tool";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShapeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ShapeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const addEditableSVG = (file: File) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const svgString = event.currentTarget.result;
      editor && editor.addEditableSVG(svgString);
    };
    reader.readAsText(file);
  };

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "shapes" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Elements"
        description="Add elements to your credential"
      />
      <Button
        onClick={() => document.getElementById("background-input")?.click()}
        className="border-basePrimary border-2 text-basePrimary bg-transparent flex gap-4 justify-center items-center rounded-lg py-2 px-3 hover:bg-basePrimary/20"
      >
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth={2}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1={12} y1={3} x2={12} y2={15} />
        </svg>
        <span>Import Element</span>
      </Button>
      <div className="hidden">
        <Input
          id="background-input"
          name="background"
          type="file"
          onChange={(e) => e.target.files && addEditableSVG(e.target.files[0])}
          accept="image/svg+xml"
        />
      </div>
      <ScrollArea>
        <div className="grid grid-cols-3 gap-4 p-4">
          <ShapeTool
            onClick={() => editor?.addHorizontalLine()}
            icon={() => (
              <div>
                <div className="h-2 w-full bg-black" />
              </div>
            )}
          />
          <ShapeTool
            onClick={() => editor?.addVerticalLine()}
            icon={() => (
              <div className="h-full flex justify-center">
                <div className="h-full w-2 bg-black" />
              </div>
            )}
          />
          <ShapeTool onClick={() => editor?.addCircle()} icon={FaCircle} />
          <ShapeTool
            onClick={() => editor?.addSoftRectangle()}
            icon={FaSquare}
          />
          <ShapeTool
            onClick={() => editor?.addRectangle()}
            icon={FaSquareFull}
          />
          <ShapeTool onClick={() => editor?.addTriangle()} icon={IoTriangle} />
          <ShapeTool
            onClick={() => editor?.addInverseTriangle()}
            icon={IoTriangle}
            iconClassName="rotate-180"
          />
          <ShapeTool onClick={() => editor?.addDiamond()} icon={FaDiamond} />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
