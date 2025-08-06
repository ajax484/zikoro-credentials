import { useEffect, useRef, useState } from "react";

import { FaBold, FaItalic, FaStrikethrough, FaUnderline } from "react-icons/fa";
import { TbColorFilter } from "react-icons/tb";
import { BsBorderWidth } from "react-icons/bs";
import { RxTransparencyGrid } from "react-icons/rx";
import {
  ArrowUp,
  ArrowDown,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash,
  Copy,
  Replace,
  Group,
  Ungroup,
  AlignCenterIcon,
} from "lucide-react";

import { isTextType } from "@/components/editor/utils";
import { FontSizeInput } from "@/components/editor/components/font-size-input";
import {
  ActiveTool,
  Editor,
  FONT_SIZE,
  FONT_WEIGHT,
} from "@/components/editor/types";

import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { PiSquareSplitHorizontal } from "react-icons/pi";
import toast from "react-hot-toast";
import { uploadFile } from "@/utils/helpers";
import { useGetData, useMutateData } from "@/hooks/services/request";
import { TOrganization } from "@/types/organization";
import {
  BezierCurve,
  FlipHorizontal,
  FlipVertical,
  Lock,
  LockOpen,
  Palette,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ToolbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  organizationId: string;
}

export const Toolbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  organizationId,
}: ToolbarProps) => {
  const initialFillColor = editor?.getActiveFillColor();
  const initialStrokeColor = editor?.getActiveStrokeColor();
  const initialFontFamily = editor?.getActiveFontFamily();
  const initialFontWeight = editor?.getActiveFontWeight() || FONT_WEIGHT;
  const initialFontStyle = editor?.getActiveFontStyle();
  const initialFontLinethrough = editor?.getActiveFontLinethrough();
  const initialFontUnderline = editor?.getActiveFontUnderline();
  const initialTextAlign = editor?.getActiveTextAlign();
  const initialFontSize = editor?.getActiveFontSize() || FONT_SIZE;

  const [properties, setProperties] = useState({
    fillColor: initialFillColor,
    strokeColor: initialStrokeColor,
    fontFamily: initialFontFamily,
    fontWeight: initialFontWeight,
    fontStyle: initialFontStyle,
    fontLinethrough: initialFontLinethrough,
    fontUnderline: initialFontUnderline,
    textAlign: initialTextAlign,
    fontSize: initialFontSize,
  });

  const selectedObject = editor?.selectedObjects[0];
  const selectedObjectType = editor?.selectedObjects[0]?.type;

  console.log(selectedObjectType);
  console.log(editor?.selectedObjects.length);
  console.log(editor?.selectedObjects);

  const isText = isTextType(selectedObjectType);
  const isImage = selectedObjectType === "image";
  const isRect = selectedObjectType === "rect";
  const isSVG = selectedObject?.isSVG;

  console.log(isSVG);

  const onChangeFontSize = (value: number) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeFontSize(value);
    setProperties((current) => ({
      ...current,
      fontSize: value,
    }));
  };

  const onChangeTextAlign = (value: string) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeTextAlign(value);
    setProperties((current) => ({
      ...current,
      textAlign: value,
    }));
  };

  const toggleBold = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontWeight > 500 ? 500 : 700;

    editor?.changeFontWeight(newValue);
    setProperties((current) => ({
      ...current,
      fontWeight: newValue,
    }));
  };

  const toggleItalic = () => {
    if (!selectedObject) {
      return;
    }

    const isItalic = properties.fontStyle === "italic";
    const newValue = isItalic ? "normal" : "italic";

    editor?.changeFontStyle(newValue);
    setProperties((current) => ({
      ...current,
      fontStyle: newValue,
    }));
  };

  const toggleLinethrough = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontLinethrough ? false : true;

    editor?.changeFontLinethrough(newValue);
    setProperties((current) => ({
      ...current,
      fontLinethrough: newValue,
    }));
  };

  const toggleUnderline = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontUnderline ? false : true;

    editor?.changeFontUnderline(newValue);
    setProperties((current) => ({
      ...current,
      fontUnderline: newValue,
    }));
  };

  const {
    data: organization,
    isLoading: workspaceIsLoading,
    getData: getOrganization,
  } = useGetData<TOrganization>(`workspaces/${organizationId}`);

  const { mutateData: updateOrganization, isLoading: updating } =
    useMutateData<TOrganization>(`workspaces/${organizationId}`, true);

  const [elementUploading, setElementUploading] = useState<boolean>(false);

  const onChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      if (!file) return;
      setElementUploading(true);
      const { url, error } = await uploadFile(file, "image");

      if (error || !url) throw error;
      alert("File uploaded successfully");

      editor?.changeImage(url);

      const payload = organization?.certificateAsset
        ? {
            certificateAsset: {
              ...organization?.certificateAsset,
              elements: organization?.certificateAsset?.elements
                ? [...organization?.certificateAsset?.elements, url]
                : [url],
            },
          }
        : {
            certificateAsset: {
              elements: [url],
              backgrounds: [],
            },
          };

      console.log(payload.certificateAsset.elements);

      await updateOrganization({
        payload,
      });

      await getOrganization();
    } catch (error) {
      alert("error uploading profile picture");
      console.error("Error uploading file:", error);
    } finally {
      setElementUploading(false);
    }
  };

  useEffect(() => {
    interface KeyboardEventWithKey extends KeyboardEvent {
      key: string;
    }

    const handleKeyDown = (e: KeyboardEventWithKey) => {
      const isInput = ["INPUT", "TEXTAREA"].includes(
        (e.target as HTMLElement).tagName
      );
      // Delete/Backspace handling
      if (e.key === "Delete") {
        editor?.delete();
      }
      // Copy handling (Ctrl+C/Cmd+C)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        e.preventDefault();
        editor?.onCopy();
      }
      // Paste handling (Ctrl+V/Cmd+V)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        editor?.onPaste();
      }

      // close sidebar when pressing escape
      else if (e.key.toLowerCase() === "escape") {
        e.preventDefault();
        onChangeActiveTool("select");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]); // Added editor to dependency array for safety

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [alignmentDropdown, setAlignmentDropdown] = useState<boolean>(false);

  if (editor?.selectedObjects.length === 0) {
    return (
      <div className="z-[49] flex h-[56px] w-full shrink-0 items-center gap-x-2 overflow-x-auto border-b bg-white p-2" />
    );
  }

  const SVGColors = () => {
    return (
      <div className="flex h-full items-center justify-center">
        <Hint label="SVG Colors" side="bottom" sideOffset={5}>
          <Button
            onClick={() => onChangeActiveTool("svg-fill")}
            size="icon"
            variant="ghost"
            className={cn(activeTool === "fill" && "bg-gray-100")}
          >
            <div className="size-8 bg-white rounded-full flex items-center justify-center border">
              <Palette size={28} />
            </div>
          </Button>
        </Hint>
      </div>
    );
  };

  return (
    <div className="z-[50] flex h-[56px] w-full shrink-0 items-center gap-x-2 overflow-x-auto border-b bg-white p-2">
      {(!isImage && !isSVG) && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Color" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("fill")}
              size="icon"
              variant="ghost"
              className={cn(activeTool === "fill" && "bg-gray-100")}
            >
              <div
                className="size-4 rounded-sm border"
                style={{ backgroundColor: properties.fillColor }}
              />
            </Button>
          </Hint>
        </div>
      )}
      {isSVG && <SVGColors />}
      {(isRect || isImage) && (
        <div className="flex h-full items-center justify-center">
          <Hint label="border Radius" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("border-radius")}
              size="icon"
              variant="ghost"
              className={cn(activeTool === "border-radius" && "bg-gray-100")}
            >
              <BezierCurve size="16" />
            </Button>
          </Hint>
        </div>
      )}
      {editor?.selectedObjects.length === 1 && (
        <div className="flex h-full items-center justify-center">
          <Hint label="alignment" side="bottom" sideOffset={5}>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onChangeActiveTool("alignment")}
            >
              <AlignCenterIcon size={16} />
            </Button>
          </Hint>
        </div>
      )}
      {!isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Stroke color" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("stroke-color")}
              size="icon"
              variant="ghost"
              className={cn(activeTool === "stroke-color" && "bg-gray-100")}
            >
              <div
                className="size-4 rounded-sm border-2 bg-white"
                style={{ borderColor: properties.strokeColor }}
              />
            </Button>
          </Hint>
        </div>
      )}
      {!isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Stroke width" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("stroke-width")}
              size="icon"
              variant="ghost"
              className={cn(activeTool === "stroke-width" && "bg-gray-100")}
            >
              <BsBorderWidth className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Font" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("font")}
              size="icon"
              variant="ghost"
              className={cn(
                "w-auto px-2 text-sm",
                activeTool === "font" && "bg-gray-100"
              )}
            >
              <div className="max-w-[100px] truncate">
                {properties.fontFamily}
              </div>
              <ChevronDown className="ml-2 size-4 shrink-0" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Bold" side="bottom" sideOffset={5}>
            <Button
              onClick={toggleBold}
              size="icon"
              variant="ghost"
              className={cn(properties.fontWeight > 500 && "bg-gray-100")}
            >
              <FaBold className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Italic" side="bottom" sideOffset={5}>
            <Button
              onClick={toggleItalic}
              size="icon"
              variant="ghost"
              className={cn(properties.fontStyle === "italic" && "bg-gray-100")}
            >
              <FaItalic className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Underline" side="bottom" sideOffset={5}>
            <Button
              onClick={toggleUnderline}
              size="icon"
              variant="ghost"
              className={cn(properties.fontUnderline && "bg-gray-100")}
            >
              <FaUnderline className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Strike" side="bottom" sideOffset={5}>
            <Button
              onClick={toggleLinethrough}
              size="icon"
              variant="ghost"
              className={cn(properties.fontLinethrough && "bg-gray-100")}
            >
              <FaStrikethrough className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Align left" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextAlign("left")}
              size="icon"
              variant="ghost"
              className={cn(properties.textAlign === "left" && "bg-gray-100")}
            >
              <AlignLeft className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Align center" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextAlign("center")}
              size="icon"
              variant="ghost"
              className={cn(properties.textAlign === "center" && "bg-gray-100")}
            >
              <AlignCenter className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Align right" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextAlign("right")}
              size="icon"
              variant="ghost"
              className={cn(properties.textAlign === "right" && "bg-gray-100")}
            >
              <AlignRight className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <FontSizeInput
            value={properties.fontSize}
            onChange={onChangeFontSize}
          />
        </div>
      )}
      {isImage && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Filters" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("filter")}
              size="icon"
              variant="ghost"
              className={cn(activeTool === "filter" && "bg-gray-100")}
            >
              <TbColorFilter className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isImage && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Remove background" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("remove-bg")}
              size="icon"
              variant="ghost"
              className={cn(activeTool === "remove-bg" && "bg-gray-100")}
            >
              <PiSquareSplitHorizontal className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isImage && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Replace" side="bottom" sideOffset={5}>
            <Button
              disabled={elementUploading}
              onClick={() => imageInputRef.current?.click()}
              size="icon"
              variant="ghost"
            >
              <Replace className="size-4" />
            </Button>
          </Hint>
          <input
            accept="image/*"
            className="hidden"
            type="file"
            onChange={onChangeImage}
            ref={imageInputRef}
          />
        </div>
      )}
      {!selectedObject?.options?.isBarCode && (
        <>
          <div className="flex h-full items-center justify-center">
            <Hint label="Flip Horizontal" side="bottom" sideOffset={5}>
              <Button
                onClick={() => editor?.flipShape(!selectedObject.flipX, null)}
                size="icon"
                variant="ghost"
              >
                <FlipHorizontal size={16} />
              </Button>
            </Hint>
          </div>
          <div className="flex h-full items-center justify-center">
            <Hint label="Flip Vertical" side="bottom" sideOffset={5}>
              <Button
                onClick={() => editor?.flipShape(null, !selectedObject.flipY)}
                size="icon"
                variant="ghost"
              >
                <FlipVertical size={16} />
              </Button>
            </Hint>
          </div>
        </>
      )}
      <div className="flex h-full items-center justify-center">
        <Hint label="Bring forward" side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.bringForward()}
            size="icon"
            variant="ghost"
          >
            <ArrowUp className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex h-full items-center justify-center">
        <Hint label="Send backwards" side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.sendBackwards()}
            size="icon"
            variant="ghost"
          >
            <ArrowDown className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex h-full items-center justify-center">
        <Hint label="Opacity" side="bottom" sideOffset={5}>
          <Button
            onClick={() => onChangeActiveTool("opacity")}
            size="icon"
            variant="ghost"
            className={cn(activeTool === "opacity" && "bg-gray-100")}
          >
            <RxTransparencyGrid className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex h-full items-center justify-center">
        <Hint label="Duplicate" side="bottom" sideOffset={5}>
          <Button
            onClick={() => {
              editor?.onCopy();
              editor?.onPaste();
            }}
            size="icon"
            variant="ghost"
          >
            <Copy className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex h-full items-center justify-center">
        <Hint label="Delete" side="bottom" sideOffset={5}>
          <Button onClick={() => editor?.delete()} size="icon" variant="ghost">
            <Trash className="size-4" />
          </Button>
        </Hint>
      </div>
      {selectedObject && (
        <div className="flex h-full items-center justify-center">
          <Hint
            label={selectedObject && selectedObject.locked ? "Unlock" : "Lock"}
            side="bottom"
            sideOffset={5}
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                !selectedObject.locked
                  ? editor.lockSelectedObjects(selectedObject)
                  : editor.unlockSelectedObjects(selectedObject);
              }}
              title="Lock/Unlock"
              className={cn(activeTool === "lock" && "bg-gray-100")}
            >
              {selectedObject.locked ? (
                <Lock size={16} />
              ) : (
                <LockOpen size={16} />
              )}
            </Button>
          </Hint>
        </div>
      )}
      {editor && (
        <div className="flex h-full items-center justify-center space-x-2">
          {selectedObjectType === "group" && !selectedObject?.isSVG ? (
            <Hint label="Ungroup" side="bottom" sideOffset={5}>
              <Button
                onClick={() => editor.ungroupObjects()}
                size="icon"
                variant="ghost"
              >
                <Ungroup className="size-4" />
              </Button>
            </Hint>
          ) : editor.selectedObjects.length > 1 ? (
            <Hint label="Group" side="bottom" sideOffset={5}>
              <Button
                onClick={() => editor.groupObjects()}
                size="icon"
                variant="ghost"
              >
                <Group className="size-4" />
              </Button>
            </Hint>
          ) : null}
        </div>
      )}
    </div>
  );
};
