import { fabric } from "fabric";
import { useCallback, useState, useMemo, useRef } from "react";
import {
  Editor,
  FILL_COLOR,
  STROKE_WIDTH,
  STROKE_COLOR,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  TRIANGLE_OPTIONS,
  BuildEditorProps,
  RECTANGLE_OPTIONS,
  EditorHookProps,
  STROKE_DASH_ARRAY,
  TEXT_OPTIONS,
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_SIZE,
  JSON_KEYS,
  BORDER_RADIUS,
} from "@/components/editor/types";
import { useHistory } from "@/components/editor/hooks/use-history";
import {
  createFilter,
  downloadFile,
  isTextType,
  transformText,
} from "@/components/editor/utils";
import { useHotkeys } from "@/components/editor/hooks/use-hotkeys";
import { useClipboard } from "@/components/editor/hooks//use-clipboard";
import { useAutoResize } from "@/components/editor/hooks/use-auto-resize";
import { useCanvasEvents } from "@/components/editor/hooks/use-canvas-events";
import { useWindowEvents } from "@/components/editor/hooks/use-window-events";
import { useLoadState } from "@/components/editor/hooks/use-load-state";
import jsPDF from "jspdf";
import {
  base64ToFile,
  generateAlphanumericHash,
  rgbaToHex,
  uploadFile,
} from "@/utils/helpers";
import { z } from "zod";
import { barCodeTypeEnum } from "../components/qrcode-sidebar";
import { nanoid } from "nanoid";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

const generateBarcodeImage = async (
  value: string,
  type: string,
  foregroundColor: string = "#000000",
  backgroundColor: string = "#ffffff"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary canvas element
      const canvas = document.createElement("canvas");

      // Define barcode options
      const options = {
        format: type.toUpperCase(),
        width: 2,
        height: 100,
        displayValue: true,
        text: value,
        textAlign: "center" as const,
        textPosition: "bottom" as const,
        textMargin: 2,
        fontSize: 20,
        background: backgroundColor,
        lineColor: foregroundColor,
        margin: 10,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
      };

      // Generate barcode
      JsBarcode(canvas, value, options);

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png");

      resolve(dataUrl);
    } catch (error) {
      console.error("Error generating barcode:", error);
      reject(error);
    }
  });
};

const generateQRCodeImage = async (
  value: string,
  foregroundColor: string = "000000",
  backgroundColor: string = "ffffff"
): Promise<string> => {
  try {
    const options = {
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      width: 200,
      margin: 2,
      errorCorrectionLevel: "M" as const,
    };

    console.log(foregroundColor, backgroundColor);

    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(value, options);
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

const buildEditor = ({
  save,
  undo,
  redo,
  canRedo,
  canUndo,
  autoZoom,
  copy,
  paste,
  canvas,
  fillColor,
  fontFamily,
  setFontFamily,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  borderRadius,
  setBorderRadius,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray,
  toggleQRCode,
}: BuildEditorProps): Editor => {
  const generateSaveOptions = () => {
    const { width, height, left, top } = getWorkspace() as fabric.Rect;

    return {
      name: "Image",
      format: "png",
      quality: 1,
      width,
      height,
      left,
      top,
    };
  };

  const savePdf = (
    {
      width,
      height,
    }: {
      width: number;
      height: number;
    },
    name?: string
  ) => {
    console.log(width, height);
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    const pdf = new jsPDF({
      orientation: width > height ? "l" : "p",
      unit: "pt",
      format: [options.width, options.height],
    });

    pdf.addImage(dataUrl, "png", 0, 0, width, height);
    pdf.save(name || "untitled.pdf");

    autoZoom();
  };

  const printPdf = (
    {
      width,
      height,
    }: {
      width: number;
      height: number;
    },
    name?: string
  ) => {
    console.log(width, height);
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    const pdf = new jsPDF({
      orientation: width > height ? "l" : "p",
      unit: "pt",
      format: [options.width, options.height],
    });

    pdf.addImage(dataUrl, "png", 0, 0, width, height);
    pdf.autoPrint({ variant: "non-conform" });
    pdf.save(name || "untitled.pdf");

    autoZoom();
  };

  const savePng = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "png");
    autoZoom();
  };

  const saveSvg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "svg");
    autoZoom();
  };

  const generateLinkAsync = async (next: (url: string) => void) => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = await canvas.toDataURL((err, url) => {
      if (err) throw err;
      console.log(url);
      next(url);
    });

    return dataUrl;
  };

  const generateLink = (isLive = false) => {
    const options = generateSaveOptions();

    isLive && canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    return dataUrl;
  };

  const saveJpg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "jpg");
    autoZoom();
  };

  const saveJson = async (attributes: string[]) => {
    const dataUrl = canvas.toJSON(JSON_KEYS);

    await transformText(dataUrl.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(
        {
          attributes,
          JSON: dataUrl,
        },
        null,
        "\t"
      )
    )}`;
    downloadFile(fileString, "json");
  };

  const loadJson = async (json: string) => {
    const data = JSON.parse(json);

    canvas.loadFromJSON(data, () => {
      console.log(data);
      autoZoom();
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    });
  };

  // Optimized barcode processing with batch operations
  const processBarcodeObjects = async () => {
    const barcodeObjects = canvas
      .getObjects()
      .filter(
        (object) => object instanceof fabric.Image && object.options?.isBarCode
      );

    if (barcodeObjects.length === 0) return;

    console.log(`Processing ${barcodeObjects.length} barcode objects`);

    // Process barcodes in parallel with limited concurrency
    const BATCH_SIZE = 5; // Can increase since we're not making API calls
    const batches = [];

    for (let i = 0; i < barcodeObjects.length; i += BATCH_SIZE) {
      batches.push(barcodeObjects.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (object) => {
          try {
            const { value, barCodeType, fg, bg } = object.options || {};

            if (!value || !barCodeType) return;

            let dataUrl: string;

            // Generate barcode or QR code based on type
            if (barCodeType.toLowerCase() === "qr") {
              dataUrl = await generateQRCodeImage(
                value,
                fg || "#000000",
                bg || "#ffffff"
              );
            } else {
              dataUrl = await generateBarcodeImage(
                value,
                barCodeType,
                fg || "#000000",
                bg || "#ffffff"
              );
            }

            // Update the object's source with the new data URL
            await new Promise<void>((resolve) => {
              object.setSrc(
                dataUrl,
                function (img) {
                  img.set({
                    left: object.left,
                    top: object.top,
                    height: object.height,
                    width: object.width,
                  });
                  resolve();
                },
                {
                  crossOrigin: "anonymous",
                }
              );
            });
          } catch (barcodeError) {
            console.error("Error processing barcode image:", barcodeError);
          }
        })
      );
    }

    canvas.renderAll();
  };

  // Optimized loadJsonAsync with better error handling and performance
  const loadJsonAsync = async (json: string): Promise<string> => {
    try {
      const data = JSON.parse(json);
      const options = generateSaveOptions();

      return await new Promise<string>((resolve, reject) => {
        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
          reject(new Error("Canvas loading timeout"));
        }, 30000); // 30 second timeout

        canvas.loadFromJSON(data, async () => {
          try {
            clearTimeout(timeout);

            // Set viewport and zoom
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

            // Process barcode objects if they exist
            await processBarcodeObjects();

            // Wait for images to load with shorter delay
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Generate the final data URL
            const dataUrl = canvas.toDataURL(options);
            resolve(dataUrl);
          } catch (canvasError) {
            clearTimeout(timeout);
            console.error("Error in loadJsonAsync:", canvasError);
            reject(canvasError);
          }
        });
      });
    } catch (error) {
      console.error("Error loading JSON:", error);
      throw error;
    }
  };

  // Batch processing method for multiple certificates
  const loadMultipleJsonAsync = async (
    jsonDataArray: Array<{ json: string; width: number; height: number }>
  ): Promise<string[]> => {
    const results: string[] = [];

    for (const { json, width, height } of jsonDataArray) {
      try {
        // Change canvas size only when needed
        const workspace = getWorkspace();
        const currentWidth = workspace?.width || 0;
        const currentHeight = workspace?.height || 0;

        if (currentWidth !== width || currentHeight !== height) {
          workspace?.set({ width, height });
        }

        const dataUrl = await loadJsonAsync(json);
        results.push(dataUrl);
      } catch (error) {
        console.error("Error processing certificate:", error);
        results.push(""); // Add empty string for failed certificates
      }
    }

    return results;
  };

  const getWorkspace = () => {
    return canvas.getObjects().find((object) => object.name === "clip");
  };

  const center = (object: fabric.Object) => {
    const workspace = getWorkspace();
    const center = workspace?.getCenterPoint();

    if (!center) return;

    // @ts-ignore
    canvas._centerObject(object, center);
  };

  const addToCanvas = (object: fabric.Object, selectable = true) => {
    center(object);
    if (!object.objectId) {
      object.objectId = nanoid();
      // object name should be its position within the array of objects of similar type
      object.objectName =
        (object.type || "object").toLowerCase() +
        " " +
        canvas.getObjects().filter((o) => o.type === object.type).length;
      object.locked = false;
    }
    console.log(object.objectId);
    object.set({ selectable });
    canvas.add(object);

    canvas.setActiveObject(object);
  };

  return {
    generateLinkAsync,
    generateLink,
    savePdf,
    printPdf,
    savePng,
    saveJpg,
    saveSvg,
    saveJson,
    loadJson,
    loadJsonAsync,
    loadMultipleJsonAsync,
    canUndo,
    canRedo,
    autoZoom,
    getWorkspace,
    zoomIn: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio += 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio > 1 ? 1 : zoomRatio
      );
    },
    zoomOut: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio -= 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio < 0.2 ? 0.2 : zoomRatio
      );
    },

    changeSize: (value: { width: number; height: number }) => {
      const workspace = getWorkspace();

      workspace?.set(value);
      autoZoom();
      save();
    },
    changeBackground: (value: string) => {
      const workspace = getWorkspace();
      canvas
        .getObjects()
        .filter(
          (object) =>
            object instanceof fabric.Image &&
            (object.isBackground || !object.selectable)
        )
        .forEach((bgImage) => canvas.remove(bgImage));
      workspace?.set({ fill: value });
      canvas.renderAll();
      save();
    },
    changeBackgroundImage: (url: string) => {
      console.log(url);

      canvas.setBackgroundImage(url, canvas.renderAll.bind(canvas), {
        backgroundImageStretch: true,
      });

      canvas.renderAll();
      save();
    },
    enableDrawingMode: () => {
      canvas.discardActiveObject();
      canvas.renderAll();
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false;
    },
    onUndo: () => undo(),
    onRedo: () => redo(),
    onCopy: () => copy(),
    onPaste: () => paste(),
    changeImageFilter: (value: string) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.Image;

          const effect = createFilter(value);

          imageObject.filters = effect ? [effect] : [];
          imageObject.applyFilters();
          canvas.renderAll();
        }
      });
    },
    addImage: (value: string) => {
      const newImage =
        value === "#{placeholder_profile}#"
          ? "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg"
          : value;

      console.log(newImage);

      fabric.Image.fromURL(
        newImage,
        (image) => {
          const workspace = getWorkspace();

          image.scaleToWidth(workspace?.width || 0);
          image.scaleToHeight(workspace?.height || 0);

          addToCanvas(image);
        },
        {
          crossOrigin: "anonymous",
        }
      );
    },
    changeImage: (value: string) => {
      canvas.getActiveObjects().forEach((object: fabric.Object) => {
        if (object.type === "image") {
          object.setSrc(
            value,
            function (img) {
              img.set({
                left: object.left,
                top: object.top,
                height: object.height,
                width: object.width,
              });
              console.log(img.src);
              canvas.renderAll();
            },
            {
              crossOrigin: "anonymous",
            }
          );
        }
      });

      canvas.renderAll();
    },
    addBackgroundImage: (value: string) => {
      console.log("Adding background image:", value);

      fabric.Image.fromURL(
        value,
        (image) => {
          const workspace = getWorkspace();
          if (!workspace) return;

          console.log(image);

          // Remove any existing background image
          canvas
            .getObjects()
            .filter(
              (object) =>
                object instanceof fabric.Image &&
                (object.isBackground || !object.selectable)
            )
            .forEach((bgImage) => {
              canvas.remove(bgImage);
            });

          if (!image) return;

          const containerWidth = workspace.width || 1200;
          const containerHeight = workspace.height || 900;

          // // Scale the image to fit the container
          // if (image.width / image.height > containerWidth / containerHeight) {
          //   image.height = containerHeight;
          //   image.scaleToWidth(containerWidth); // Fit by width
          // } else {
          //   image.width = containerWidth;
          //   image.scaleToHeight(containerHeight); // Fit by height
          // }

          workspace.set({
            width: image.width,
            height: image.height,
          });

          // Center the image in the container
          image.set({
            left: (containerWidth - image.getScaledWidth()) / 2,
            top: (containerHeight - image.getScaledHeight()) / 2,
            originX: "left",
            originY: "top",
            isBackground: true,
          });
          // Add the image to canvas and send it to the back
          addToCanvas(image, false);
          canvas.sendToBack(image);

          // Ensure no object is active & re-render canvas
          canvas.discardActiveObject();
          canvas.renderAll();
          workspace?.sendToBack();
        },
        { crossOrigin: "anonymous" }
      );
    },
    addQRCode: async (
      value: string,
      color: string,
      bgcolor: string,
      type: z.infer<typeof barCodeTypeEnum>,
      barCodeFunction: string
    ) => {
      console.log(color, bgcolor);
      try {
        let dataUrl: string;

        // Generate barcode or QR code based on type
        if (type.toLowerCase() === "qr") {
          dataUrl = await generateQRCodeImage(
            value,
            color || "#000000",
            bgcolor || "#ffffff"
          );
        } else {
          dataUrl = await generateBarcodeImage(
            value,
            type,
            color || "#000000",
            bgcolor || "#ffffff"
          );
        }

        fabric.Image.fromURL(
          dataUrl,
          (image) => {
            console.log(image);
            const workspace = getWorkspace();

            const assetId = generateAlphanumericHash();

            image.set({
              options: {
                bg: bgcolor || "ffffff",
                fg: color || "000000",
                barCodeType: type,
                isBarCode: true,
                value,
                barCodeFunction,
                assetId,
              },
            });

            console.log(image.options?.isBarCode);

            addToCanvas(image);
          },
          {
            crossOrigin: "anonymous",
          }
        );
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    },
    transformBarCodes: async () => {
      await processBarcodeObjects();
    },
    addEditableSVG: (svgString, options = {}) => {
      fabric.loadSVGFromString(svgString, (objects, svgOptions) => {
        const group = fabric.util.groupSVGElements(objects, svgOptions);
        group.set({
          scaleX: 10,
          scaleY: 10,
          isSVG: true,
          ...options,
        });
        addToCanvas(group);
        canvas.requestRenderAll();
      });
    },
    clear: () => {
      canvas.clear();
      canvas.renderAll();
    },
    delete: () => {
      canvas.getActiveObjects().forEach((object: fabric.Object) => {
        if (object.type === "image") {
          const imageURL = object.getSrc();
          if (
            imageURL.includes(
              "https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=svg"
            )
          ) {
            toggleQRCode(false);
          }
        }

        canvas.remove(object);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    changeAlignment: (position, object) => {
      const workspace = getWorkspace() as fabric.Rect;
      if (!workspace) {
        console.log("No workspace found");
        return;
      }

      const centerPoint = workspace.getCenterPoint();
      const { width, height } = workspace;
      if (!width || !height) {
        console.log("Invalid workspace dimensions");
        return;
      }

      const getNewPosition = (object: fabric.Object) => {
        switch (position) {
          case "top-left":
            return {
              top: centerPoint.y - height / 2,
              left: centerPoint.x - width / 2,
            };
            break;
          case "top-center":
            return {
              top: centerPoint.y - height / 2,
              left: centerPoint.x - object.getScaledWidth() / 2,
            };
            break;
          case "top-right":
            return {
              top: centerPoint.y - height / 2,
              left: centerPoint.x + width / 2 - object.getScaledWidth(),
            };
            break;
          case "middle-left":
            return {
              top: centerPoint.y - object.getScaledHeight() / 2,
              left: centerPoint.x - width / 2,
            };
            break;
          case "middle-center":
            return {
              top: centerPoint.y - object.getScaledHeight() / 2,
              left: centerPoint.x - object.getScaledWidth() / 2,
            };
            break;
          case "middle-right":
            return {
              top: centerPoint.y - object.getScaledHeight() / 2,
              left: centerPoint.x + width / 2 - object.getScaledWidth(),
            };
            break;
          case "bottom-left":
            return {
              top: centerPoint.y + height / 2 - object.getScaledHeight(),
              left: centerPoint.x - width / 2,
            };
            break;
          case "bottom-center":
            return {
              top: centerPoint.y + height / 2 - object.getScaledHeight(),
              left: centerPoint.x - object.getScaledWidth() / 2,
            };
            break;
          case "bottom-right":
            return {
              top: centerPoint.y + height / 2 - object.getScaledHeight(),
              left: centerPoint.x + width / 2 - object.getScaledWidth(),
            };
            break;
          default:
            return {
              top: centerPoint.y - object.getScaledHeight() / 2,
              left: centerPoint.x - object.getScaledWidth() / 2,
            };
        }
      };

      if (object) {
        const newPosition = getNewPosition(object);
        object.set({
          left: newPosition.left,
          top: newPosition.top,
        });
      } else {
        const activeObjects = canvas.getActiveObjects();
        if (!activeObjects.length) {
          return;
        }

        activeObjects.forEach((object) => {
          const newPosition = getNewPosition(object);
          object.set({
            left: newPosition.left,
            top: newPosition.top,
          });
        });
      }

      canvas.requestRenderAll();
    },
    flipShape: (flipX, flipY, object) => {
      if (object) {
        const updates: Partial<fabric.Object> = {};
        if (flipX !== null) {
          updates.flipX = flipX;
        }
        if (flipY !== null) {
          updates.flipY = flipY;
        }
        object.set(updates);
      } else {
        const activeObjects = canvas.getActiveObjects();
        if (!activeObjects.length) {
          return;
        }

        activeObjects.forEach((object) => {
          const updates: Partial<fabric.Object> = {};
          if (flipX !== undefined) {
            updates.flipX = flipX;
          }
          if (flipY !== undefined) {
            updates.flipY = flipY;
          }
          object.set(updates);
        });
      }

      canvas.requestRenderAll();
    },
    groupObjects: () => {
      const active = canvas.getActiveObject();

      // If it’s an ActiveSelection, convert it natively
      if (active && active.type === "activeSelection") {
        const group = (active as fabric.ActiveSelection).toGroup();
        group.objectId = nanoid();
        canvas.setActiveObject(group);
        canvas.requestRenderAll();
        return;
      }

      // Otherwise, manually group any multiple selection
      const objects = canvas.getActiveObjects();
      if (objects.length < 2) return;

      const group = new fabric.Group(objects, {
        hasControls: false,
        lockScalingFlip: true,
      });

      // Clean up old objects & add the new group
      canvas.discardActiveObject();
      objects.forEach((obj) => canvas.remove(obj));
      addToCanvas(group);
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
    },
    ungroupObjects: () => {
      const active = canvas.getActiveObject();
      if (!active) return;

      // Handle native toActiveSelection if it’s a Group
      if (active.type === "group") {
        const selection = (active as fabric.Group).toActiveSelection();
        canvas.setActiveObject(selection);
        canvas.requestRenderAll();
        return;
      }

      // If it’s already an ActiveSelection, do nothing
      if (active.type === "activeSelection") return;

      // Otherwise, check if multiple were somehow selected
      const objects = canvas.getActiveObjects();
      if (objects.length < 2) return;

      // Explode them: remove each from any group and re-add
      canvas.discardActiveObject();
      objects.forEach((obj) => {
        canvas.remove(obj);
        addToCanvas(obj);
      });
      const selection = new fabric.ActiveSelection(objects, { canvas });
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
    },
    getAllObjects: () => {
      return [...canvas.getObjects()];
    },
    getActiveObject: () => {
      return canvas.getActiveObject();
    },
    selectObject: (object) => {
      canvas.setActiveObject(object);
      canvas.requestRenderAll();
    },
    deleteObject: (object) => {
      canvas.remove(object);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    },
    updateObject: (object: fabric.Object, options: Record<string, any>) => {
      canvas.setActiveObject(object);
      object.set({ ...object.options, ...options });
      canvas.requestRenderAll();
    },
    lockSelectedObjects: (object?: fabric.Object) => {
      const applyLock = (obj: fabric.Object) => {
        obj.set({
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          locked: true,
        });
      };

      if (object) {
        applyLock(object);
      } else {
        canvas.getActiveObjects().forEach((object) => {
          applyLock(object);
        });
      }

      canvas.requestRenderAll();
    },
    unlockSelectedObjects: (object?: fabric.Object) => {
      const applyUnlock = (obj: fabric.Object) => {
        obj.set({
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
          locked: false,
        });
      };

      if (object) {
        applyUnlock(object);
      } else {
        canvas.getActiveObjects().forEach((object) => {
          applyUnlock(object);
        });
      }

      canvas.requestRenderAll();
    },

    addText: (value, options) => {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        ...options,
      });

      addToCanvas(object);
    },
    getActiveOpacity: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 1;
      }

      const value = selectedObject.get("opacity") || 1;

      return value;
    },
    changeFontSize: (value: number) => {
      const objects = canvas.getActiveObjects();

      objects.forEach((object: fabric.Object) => {
        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach((child) => {
            if (isTextType(child.type)) {
              // @ts-ignore
              child.set({ fontSize: value });
            }
          });
        } else {
          if (isTextType(object.type)) {
            // @ts-ignore
            object.set({ fontSize: value });
          }
        }
      });

      canvas.requestRenderAll();
    },

    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_SIZE;
      }

      // @ts-ignore
      const value = selectedObject.get("fontSize") || FONT_SIZE;

      return value;
    },
    changeTextAlign: (value: string) => {
      const objects = canvas.getActiveObjects();

      objects.forEach((object: fabric.Object) => {
        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach((child) => {
            if (isTextType(child.type)) {
              // @ts-ignore
              child.set({ textAlign: value });
            }
          });
        } else {
          if (isTextType(object.type)) {
            // @ts-ignore
            object.set({ textAlign: value });
          }
        }
      });

      canvas.requestRenderAll();
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "left";
      }

      // @ts-ignore
      const value = selectedObject.get("textAlign") || "left";

      return value;
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach((child) => {
            if (isTextType(child.type)) {
              // @ts-ignore
              child.set({ underline: value });
            }
          });
        } else {
          if (isTextType(object.type)) {
            // @ts-ignore
            object.set({ underline: value });
          }
        }
      });

      canvas.requestRenderAll();
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      const value = selectedObject.get("underline") || false;

      return value;
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach((child) => {
            if (isTextType(child.type)) {
              // @ts-ignore
              child.set({ linethrough: value });
            }
          });
        } else {
          if (isTextType(object.type)) {
            // @ts-ignore
            object.set({ linethrough: value });
          }
        }
      });

      canvas.requestRenderAll();
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      const value = selectedObject.get("linethrough") || false;

      return value;
    },
    changeFontStyle: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach((child) => {
            if (isTextType(child.type)) {
              // @ts-ignore
              child.set({ fontStyle: value });
            }
          });
        } else {
          if (isTextType(object.type)) {
            // @ts-ignore
            object.set({ fontStyle: value });
          }
        }
      });

      canvas.requestRenderAll();
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "normal";
      }

      // @ts-ignore
      const value = selectedObject.get("fontStyle") || "normal";

      return value;
    },
    changeFontWeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach((child) => {
            if (isTextType(child.type)) {
              // @ts-ignore
              child.set({ fontWeight: value });
            }
          });
        } else {
          if (isTextType(object.type)) {
            // @ts-ignore
            object.set({ fontWeight: value });
          }
        }
      });

      canvas.requestRenderAll();
    },
    changeOpacity: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach((child) => {
            child.set({ opacity: value });
          });
        } else {
          object.set({ opacity: value });
        }
      });

      canvas.requestRenderAll();
    },
    bringForward: (obj) => {
      if (obj) {
        canvas.bringForward(obj);
      } else {
        canvas.getActiveObjects().forEach((object) => {
          canvas.bringForward(object);
        });
      }

      canvas.renderAll();

      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    sendBackwards: (obj) => {
      if (obj) {
        canvas.sendBackwards(obj);
      } else {
        canvas.getActiveObjects().forEach((object) => {
          canvas.sendBackwards(object);
        });
      }

      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    moveObjectToIndex: (obj: fabric.Object, targetIndex: number) => {
      if (!obj || !canvas) return;

      // Get all objects in the canvas
      const objects = canvas.getObjects();
      // Find the current index of the object
      const currentIndex = objects.indexOf(obj);
      if (currentIndex === -1) return; // Object not found

      // Ensure targetIndex is within bounds
      const maxIndex = objects.length - 1;
      const clampedTargetIndex = Math.max(0, Math.min(targetIndex, maxIndex));

      // Calculate the number of steps to move
      const steps = clampedTargetIndex - currentIndex;

      if (steps > 0) {
        // Move forward
        for (let i = 0; i < steps; i++) {
          canvas.bringForward(obj);
        }
      } else if (steps < 0) {
        // Move backward
        for (let i = 0; i < Math.abs(steps); i++) {
          canvas.sendBackwards(obj);
        }
      }

      canvas.requestRenderAll();
    },
    changeFontFamily: (value: string) => {
      setFontFamily(value);
      canvas.getActiveObjects().forEach((object: fabric.Object) => {
        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach((child) => {
            if (isTextType(child.type)) {
              child.set({ fontFamily: value });
            }
          });
        } else if (isTextType(object.type)) {
          object.set({ fontFamily: value });
        }
      });
      canvas.requestRenderAll();
    },

    changeFillColor: (value: string) => {
      setFillColor(value);
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach((child) => {
            child.set({ fill: value });
          });
        } else {
          object.set({ fill: value });
        }
      });
      canvas.requestRenderAll();
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value);

      canvas.getActiveObjects().forEach((object) => {
        const applyStroke = (obj: fabric.Object) => {
          if (isTextType(obj.type)) {
            obj.set({ fill: value });
          } else {
            obj.set({ stroke: value });
          }
        };

        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach(applyStroke);
        } else {
          applyStroke(object);
        }
      });

      canvas.freeDrawingBrush.color = value;
      canvas.requestRenderAll();
    },

    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value);

      canvas.getActiveObjects().forEach((object) => {
        const applyStrokeWidth = (obj: fabric.Object) => {
          obj.set({ strokeWidth: value });
        };

        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach(applyStrokeWidth);
        } else {
          applyStrokeWidth(object);
        }
      });

      canvas.freeDrawingBrush.width = value;
      canvas.requestRenderAll();
    },
    changeBorderRadius: (value: number) => {
      setBorderRadius(value);

      canvas.getActiveObjects().forEach((object) => {
        const applyBorderRadius = (obj: fabric.Object) => {
          if (obj.type === "image" || obj.type === "rect") {
            obj.set({ borderRadius: value, rx: value, ry: value });
          }
        };

        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach(applyBorderRadius);
        } else {
          applyBorderRadius(object);
        }
      });

      canvas.requestRenderAll();
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);

      canvas.getActiveObjects().forEach((object) => {
        const applyDashArray = (obj: fabric.Object) => {
          obj.set({ strokeDashArray: value });
        };

        if (object.type === "group" && object instanceof fabric.Group) {
          object.getObjects().forEach(applyDashArray);
        } else {
          applyDashArray(object);
        }
      });

      canvas.requestRenderAll();
    },
    addHorizontalLine: () => {
      const object = new fabric.Line([50, 100, 250, 100], {
        stroke: strokeColor,
        strokeWidth: 10,
        lockScalingY: true, // prevent vertical scale
        lockUniScaling: false, // allow independent X/Y, but X is locked
        hasBorders: true,
        strokeUniform: true,
      });

      object.setControlsVisibility({
        ml: true,
        mr: true,
        bl: true,
        br: true,
        tl: false,
        tr: false,
        mt: false,
        mb: false,
      });
      addToCanvas(object);
    },
    addVerticalLine: () => {
      const object = new fabric.Line([150, 50, 150, 250], {
        stroke: strokeColor,
        strokeWidth: 10,
        lockScalingX: true, // prevent horizontal scale
        lockUniScaling: false, // allow independent X/Y, but X is locked
        hasBorders: true,
        strokeUniform: true,
      });

      object.setControlsVisibility({
        ml: false,
        mr: false,
        bl: false,
        br: false,
        tl: true,
        tr: true,
        mt: true,
        mb: true,
      });

      addToCanvas(object);
    },
    addCircle: () => {
      const object = new fabric.Circle({
        ...CIRCLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addSoftRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addTriangle: () => {
      const object = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addInverseTriangle: () => {
      const HEIGHT = TRIANGLE_OPTIONS.height;
      const WIDTH = TRIANGLE_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT },
        ],
        {
          ...TRIANGLE_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );

      addToCanvas(object);
    },
    addDiamond: () => {
      const HEIGHT = DIAMOND_OPTIONS.height;
      const WIDTH = DIAMOND_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: WIDTH / 2, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 },
        ],
        {
          ...DIAMOND_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );
      addToCanvas(object);
    },

    canvas,
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_WEIGHT;
      }

      // @ts-ignore
      const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

      return value;
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fontFamily;
      }

      // @ts-ignore
      const value = selectedObject.get("fontFamily") || fontFamily;

      return value;
    },
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fillColor;
      }

      const value = selectedObject.get("fill") || fillColor;

      // Currently, gradients & patterns are not supported
      return value as string;
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeColor;
      }

      const value = selectedObject.get("stroke") || strokeColor;

      return value;
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeWidth;
      }

      const value = selectedObject.get("strokeWidth") || strokeWidth;

      return value;
    },
    getActiveBorderRadius: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return borderRadius;
      }

      const value = selectedObject.get("borderRadius") || borderRadius;

      return value;
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeDashArray;
      }

      const value = selectedObject.get("strokeDashArray") || strokeDashArray;

      return value;
    },
    selectedObjects,
  };
};

export const useEditor = ({
  defaultState,
  defaultHeight,
  defaultWidth,
  clearSelectionCallback,
  saveCallback,
  toggleQRCode,
}: EditorHookProps) => {
  const initialState = useRef(defaultState);
  const initialWidth = useRef(defaultWidth);
  const initialHeight = useRef(defaultHeight);

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
  const [fillColor, setFillColor] = useState(FILL_COLOR);
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const [borderRadius, setBorderRadius] = useState(BORDER_RADIUS);
  const [strokeDashArray, setStrokeDashArray] =
    useState<number[]>(STROKE_DASH_ARRAY);

  useWindowEvents();

  const { save, canRedo, canUndo, undo, redo, canvasHistory, setHistoryIndex } =
    useHistory({
      canvas,
      saveCallback,
    });

  const { copy, paste } = useClipboard({ canvas });

  const { autoZoom } = useAutoResize({
    canvas,
    container,
  });

  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  });

  useHotkeys({
    undo,
    redo,
    copy,
    paste,
    save,
    canvas,
  });

  useLoadState({
    canvas,
    autoZoom,
    initialState,
    canvasHistory,
    setHistoryIndex,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        undo,
        redo,
        canUndo,
        canRedo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeWidth,
        borderRadius,
        strokeColor,
        setBorderRadius,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        strokeDashArray,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily,
        toggleQRCode,
      });
    }

    return undefined;
  }, [
    canRedo,
    canUndo,
    undo,
    redo,
    save,
    autoZoom,
    copy,
    paste,
    canvas,
    fillColor,
    strokeWidth,
    strokeColor,
    selectedObjects,
    strokeDashArray,
    fontFamily,
  ]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
      });

      const initialWorkspace = new fabric.Rect({
        width: initialWidth.current,
        height: initialHeight.current,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.8)",
          blur: 5,
        }),
      });

      console.log(initialCanvas);

      initialCanvas.setWidth(initialContainer?.offsetWidth);
      initialCanvas.setHeight(initialContainer?.offsetHeight);

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);
      initialCanvas.clipPath = initialWorkspace;

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      const currentState = JSON.stringify(initialCanvas.toJSON(JSON_KEYS));
      canvasHistory.current = [currentState];
      setHistoryIndex(0);
    },
    [canvasHistory, setHistoryIndex]
  );

  return { init, editor };
};
