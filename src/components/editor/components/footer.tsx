import { Minimize, ZoomIn, ZoomOut } from "lucide-react";
import { Editor } from "@/components/editor/types";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

interface FooterProps {
  editor: Editor | undefined;
  workspaceId: string;
  getCredits: (url: string) => void;
  creditBalance: {
    bronze: number;
    silver: number;
    gold: number;
  };
}

export const Footer = ({
  editor,
  workspaceId,
  getCredits,
  creditBalance,
}: FooterProps) => {
  console.log(creditBalance);

  return (
    <footer className="z-[49] flex py-2 w-full shrink-0 justify-between items-center border-t bg-white p-2 px-4">
      <div className="flex gap-8 justify-center">
        <div className="flex gap-x-1 items-center">
          <div className="rounded-full p-0.5 [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]">
            <div className="rounded-full size-5 [box-shadow:_0px_8px_12px_0px_#C2AF9B66;] [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]" />
          </div>
          <span className="font-semibold">{creditBalance.bronze}</span>
        </div>
        <div className="flex gap-x-1">
          <div className="rounded-full p-0.5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]">
            <div className="rounded-full size-5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]" />
          </div>
          <span className="font-semibold">{creditBalance.silver}</span>
        </div>
        <div className="flex gap-x-1">
          <div className="rounded-full p-0.5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]">
            <div className="rounded-full size-5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]" />
          </div>
          <span className="font-semibold">{creditBalance.gold}</span>
        </div>
      </div>
      <div className="flex gap-1 items-center">
        <Hint label="Reset" side="top" sideOffset={10}>
          <Button
            onClick={() => editor?.autoZoom()}
            size="icon"
            variant="ghost"
            className="h-full"
          >
            <Minimize className="size-4" />
          </Button>
        </Hint>
        <Hint label="Zoom in" side="top" sideOffset={10}>
          <Button
            onClick={() => editor?.zoomIn()}
            size="icon"
            variant="ghost"
            className="h-full"
          >
            <ZoomIn className="size-4" />
          </Button>
        </Hint>
        <Hint label="Zoom out" side="top" sideOffset={10}>
          <Button
            onClick={() => editor?.zoomOut()}
            size="icon"
            variant="ghost"
            className="h-full"
          >
            <ZoomOut className="size-4" />
          </Button>
        </Hint>
      </div>
    </footer>
  );
};
