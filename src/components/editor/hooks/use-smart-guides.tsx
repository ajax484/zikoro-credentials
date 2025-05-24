"use client";
import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { Rect, SmartGuideOptions, SnappingLines } from "../types";

export const useSmartGuides = (
  canvas: fabric.Canvas | null,
  options: SmartGuideOptions = {}
) => {
  const snappingLines = useRef<SnappingLines>({ vertical: [], horizontal: [] });
  const activeObject = useRef<fabric.Object | null>(null);
  const opts: Required<SmartGuideOptions> = {
    snapThreshold: 5,
    guideColor: "#ff4081",
    guideWidth: 1,
    ...options,
  };

  useEffect(() => {
    if (!canvas) return;

    const handleObjectMoving = (e: fabric.IEvent<Event>) => {
      if (!e.target) return;
      activeObject.current = e.target;
      clearGuides();
      checkForSnapping(e.target);
    };

    const clearGuidesOnModified = () => clearGuides();

    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:modified", clearGuidesOnModified);

    return () => {
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:modified", clearGuidesOnModified);
    };
  }, [canvas]);

  const checkForSnapping = (movingObject: fabric.Object) => {
    if (!canvas) return;

    const movingRect = movingObject.getBoundingRect();
    const objects = canvas.getObjects().filter((obj) => obj !== movingObject);

    objects.forEach((obj) => {
      const objRect = obj.getBoundingRect();
      checkAlignment(movingRect, objRect);
    });
  };

  const checkAlignment = (movingRect: Rect, targetRect: Rect) => {
    const alignmentChecks = [
      // Horizontal
      {
        type: "left" as AlignmentType,
        moving: movingRect.left,
        target: targetRect.left,
      },
      {
        type: "right" as AlignmentType,
        moving: movingRect.left + movingRect.width,
        target: targetRect.left + targetRect.width,
      },
      {
        type: "centerX" as AlignmentType,
        moving: movingRect.left + movingRect.width / 2,
        target: targetRect.left + targetRect.width / 2,
      },

      // Vertical
      {
        type: "top" as AlignmentType,
        moving: movingRect.top,
        target: targetRect.top,
      },
      {
        type: "bottom" as AlignmentType,
        moving: movingRect.top + movingRect.height,
        target: targetRect.top + targetRect.height,
      },
      {
        type: "centerY" as AlignmentType,
        moving: movingRect.top + movingRect.height / 2,
        target: targetRect.top + targetRect.height / 2,
      },
    ];

    alignmentChecks.forEach(({ type, moving, target }) => {
      if (Math.abs(moving - target) < opts.snapThreshold) {
        handleSnapping(type, target, movingRect);
        addGuideLine(target, type.includes("X") ? "vertical" : "horizontal");
      }
    });
  };

  const handleSnapping = (
    type: AlignmentType,
    targetPosition: number,
    movingRect: Rect
  ) => {
    if (!activeObject.current) return;

    const setters: Record<AlignmentType, () => void> = {
      left: () => activeObject.current!.set("left", targetPosition),
      right: () =>
        activeObject.current!.set("left", targetPosition - movingRect.width),
      centerX: () =>
        activeObject.current!.set(
          "left",
          targetPosition - movingRect.width / 2
        ),
      top: () => activeObject.current!.set("top", targetPosition),
      bottom: () =>
        activeObject.current!.set("top", targetPosition - movingRect.height),
      centerY: () =>
        activeObject.current!.set(
          "top",
          targetPosition - movingRect.height / 2
        ),
    };

    setters[type]();
    canvas?.requestRenderAll();
  };

  const addGuideLine = (position: number, orientation: OrientationType) => {
    if (!canvas) return;

    const lineCoords =
      orientation === "vertical"
        ? [position, 0, position, canvas.height]
        : [0, position, canvas.width, position];

    const line = new fabric.Line(lineCoords, {
      stroke: opts.guideColor,
      strokeWidth: opts.guideWidth,
      selectable: false,
      evented: false,
      opacity: 0.7,
    });

    canvas.add(line);
    snappingLines.current[orientation].push(line);
  };

  const clearGuides = () => {
    if (!canvas) return;

    snappingLines.current.vertical.forEach((line) => canvas.remove(line));
    snappingLines.current.horizontal.forEach((line) => canvas.remove(line));
    snappingLines.current = { vertical: [], horizontal: [] };
  };

  return { clearGuides };
};
