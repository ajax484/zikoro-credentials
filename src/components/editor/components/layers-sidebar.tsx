import { ActiveTool, Editor } from "@/components/editor/types";
import { ToolSidebarClose } from "@/components/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/components/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Trash2Icon,
  X,
  GripVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Check, Lock, LockOpen, Pen, Trash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

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
      setLayers([...editor.getAllObjects()].reverse());
    };

    update();
  }, [editor]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    obj: fabric.Object
  ) => {
    e.dataTransfer.setData("text/plain", obj.objectId || "");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Allow dropping
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetObj: fabric.Object
  ) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    const draggedObj = layers.find((obj) => obj.objectId === draggedId);
    if (!draggedObj || !targetObj || draggedObj === targetObj) return;

    const newLayers = [...layers];
    const draggedIndex = newLayers.findIndex(
      (obj) => obj.objectId === draggedId
    );
    const targetIndex = newLayers.findIndex(
      (obj) => obj.objectId === targetObj.objectId
    );

    // Remove dragged object and insert it at the target index
    newLayers.splice(draggedIndex, 1);
    newLayers.splice(targetIndex, 0, draggedObj);

    // Update state
    setLayers(newLayers);

    // Update canvas stacking order (Fabric.js uses 0 as bottom)
    const canvasIndex = layers.length - 1 - targetIndex; // Reverse for Fabric.js
    editor?.moveObjectToIndex(draggedObj, canvasIndex);
  };

  const Layer = ({ obj, idx }: { obj: fabric.Object; idx: number }) => {
    const [editMode, setEditMode] = useState(false);
    const [newName, setNewName] = useState<string>(
      obj.objectName || `Layer ${layers.length - idx}`
    );
    const active = editor?.getActiveObject();
    const isActive = active && obj?.objectId === active.objectId;

    const updateName = () => {
      editor.updateObject(obj, {
        objectName: newName,
      });
      setEditMode(false);
    };

    if (!obj.selectable) return null;
    return (
      <div
        key={obj?.objectId}
        className={cn(
          "flex items-center justify-between p-1 rounded cursor-move",
          isActive
            ? "bg-blue-100 dark:bg-blue-900"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
        draggable
        onDragStart={(e) => handleDragStart(e, obj)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, obj)}
        onClick={() => editor.selectObject(obj)}
      >
        <GripVertical size={16} className="text-gray-500 mr-2 flex-shrink-0" />
        {!editMode ? (
          <div className="flex gap-1 items-center flex-1">
            <span className="truncate text-sm">
              {obj.objectName || `Layer ${layers.length - idx}`}
            </span>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Edit name"
              onClick={() => setEditMode(true)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <Pen size={14} />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1 items-center flex-1">
            <Input
              name="name"
              type="text"
              placeholder="Enter name"
              className=" placeholder:text-sm h-10 focus:border-gray-500 placeholder:text-gray-600 text-gray-700 flex-1"
              onInput={(e) => setNewName(e.currentTarget.value)}
              value={newName}
            />
            <div className="flex gap-0.5 items-center">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Update name"
                onClick={updateName}
              >
                <Check size={14} color="green" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Cancel"
                onClick={() => setEditMode(false)}
              >
                <X size={14} color="red" />
              </Button>
            </div>
          </div>
        )}
        <div className="flex gap-1 items-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              !obj.locked
                ? editor.lockSelectedObjects(obj)
                : editor.unlockSelectedObjects(obj);
            }}
            title="Lock/Unlock"
            className={cn(activeTool === "lock" && "bg-gray-100")}
          >
            {obj.locked ? <Lock size={16} /> : <LockOpen size={16} />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              editor.bringForward(obj);
            }}
            title="Bring Forward"
          >
            <ArrowUpIcon size={16} />
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
            <ArrowDownIcon size={16} />
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
  };

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
          <p className="text-xs text-gray-500 text-center my-4">
            Drag and drop to reorder layers
          </p>
          {layers.map((obj, idx) => (
            <Layer obj={obj} idx={idx} key={obj.objectId} />
          ))}
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
