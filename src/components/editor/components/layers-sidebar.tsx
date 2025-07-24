import { ActiveTool, Editor } from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon, Trash2Icon, X } from "lucide-react";
import { useEffect, useState } from "react";

interface LayersSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  attributes: string[];
  setAttributes: React.Dispatch<React.SetStateAction<string[]>>;
  save: () => Promise<void>;
  isSaving: boolean;
}

export const LayersSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  attributes,
  setAttributes,
  save,
  isSaving,
}: LayersSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const [layers, setLayers] = useState<fabric.Object[]>([]);

  useEffect(() => {
    const update = () => {
      if (!editor) return;
      // Fabric's internal stacking: 0 is bottom, last is top
      setLayers([...editor?.getAllObjects()].reverse());
    };

    update();
  }, [editor]);

  console.log(layers.map(({ objectId }) => objectId));

  return (
    <aside
      className={cn(
        "relative z-[40] flex h-full w-[360px] flex-col border-r bg-white",
        activeTool === "layers" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Layers"
        description="edit the layers of your credential"
      />
      <ScrollArea>
        <div className="flex-1 overflow-y-auto">
          {layers.map((obj, idx) => {
            const name = `Layer ${layers.length - idx}`;
            const active = editor?.getActiveObject();
            const isActive = active && obj?.objectId === active.objectId;

            if (obj?.objectId) {
              console.log(obj?.objectId);
            }

            if (!obj.selectable) return null;
            return (
              <div
                key={obj?.objectId}
                className={`flex items-center justify-between p-1 rounded cursor-pointer ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => editor.selectObject(obj)}
              >
                <span className="truncate text-sm">{name}</span>
                <div className="flex space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      editor.bringForward(obj);
                    }}
                    title="Bring Forward"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      editor.sendBackwards(obj);
                    }}
                    title="Send Backward"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      editor.deleteObject(obj);
                    }}
                    title="Delete Layer"
                  >
                    <Trash2Icon className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
          {layers.length === 0 && (
            <p className="text-xs text-gray-500 text-center mt-4">
              No objects on canvas.
            </p>
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
