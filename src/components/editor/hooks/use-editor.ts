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
import { AlignGuidelines } from "fabric-guideline-plugin";

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
    // const imgProperties = pdf.getImageProperties(dataUrl);
    // const pdfWidth = pdf.internal.pageSize.getWidth();
    // const pdfHeight = pdf.internal.pageSize.getHeight();

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
    // const imgProperties = pdf.getImageProperties(dataUrl);
    // const pdfWidth = pdf.internal.pageSize.getWidth();
    // const pdfHeight = pdf.internal.pageSize.getHeight();

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

    // console.log(dataUrl);

    return dataUrl;
  };

  const generateLink = (isLive = false) => {
    const options = generateSaveOptions();

    isLive && canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    // console.log(dataUrl);

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

  const loadJsonAsync = async (json: string): Promise<string> => {
    try {
      const options = generateSaveOptions();
      const data = JSON.parse(json);

      return await new Promise<string>((resolve, reject) => {
        canvas.loadFromJSON(data, async () => {
          try {
            autoZoom();
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

            console.log("here");

            const barcodeObjects = canvas
              .getObjects()
              .filter(
                (object) =>
                  object instanceof fabric.Image && object.options?.isBarCode
              );

            console.log(barcodeObjects.length);

            for (const object of barcodeObjects) {
              try {
                const { value, barCodeType } = object.options || {};

                console.log(value, barCodeType);
                if (!value || !barCodeType) continue;

                const apiUrl = `https://barcodeapi.org/api/${barCodeType}/${encodeURIComponent(
                  value
                )}`;
                const response = await fetch(apiUrl, { cache: "no-store" });
                const tokens = response.headers.get("X-RateLimit-Tokens");
                console.log("Tokens remaining:", tokens);

                const blob = await response.blob();
                const fileName = `${barCodeType}:${value}-${Date.now()}.png`;
                const file = new File([blob], fileName, {
                  type: blob.type,
                  lastModified: Date.now(),
                });

                const { url: imageUrl, error } = await uploadFile(
                  file,
                  "image"
                );
                console.log(imageUrl);

                if (error || !imageUrl) continue;

                console.log(imageUrl);

                // object.set({ src: imageUrl });
                object.setSrc(
                  imageUrl,
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
              } catch (barcodeError) {
                console.error("Error processing barcode image:", barcodeError);
              }
            }

            const dataUrl = canvas.toDataURL(options);
            resolve(dataUrl);
          } catch (canvasError) {
            reject(canvasError);
          }
        });
      });
    } catch (error) {
      console.error("Error loading JSON:", error);
      throw error;
    }
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
          if (!workspace) return; // Prevent errors if workspace is null

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

          // Mark the image as a background
          image.set({ isBackground: true });

          // Scale image to fit the workspace
          image.scaleToWidth(workspace.width || 1200);
          image.scaleToHeight(workspace.height || 900);

          console.log("final", image);

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
      try {
        const url = `https://barcodeapi.org/api/${type}/${encodeURIComponent(
          value
        )}?bg=${rgbaToHex(bgcolor || "ffffff")}&fg=${rgbaToHex(
          color || "000000"
        )}`;

        console.log(url);
        const response = await fetch(url, { cache: "no-store" });

        const tokens = response.headers.get("X-RateLimit-Tokens");
        console.log("Tokens remaining: " + tokens);

        const blob = await response.blob();

        // const imgSrc = URL.createObjectURL(blob);

        // console.log(imgSrc);

        // base64ToFile(
        //   imgSrc,
        //   type + ":" + value + new Date().getUTCMilliseconds() + ".png"
        // );

        const blobUrl = new File(
          [blob],
          type + ":" + value + new Date().getUTCMilliseconds() + ".png",
          {
            type: blob.type,
            lastModified: Date.now(),
          }
        );

        console.log(blobUrl);

        const { url: imageUrl, error } = await uploadFile(blobUrl, "image");

        console.log(imageUrl);

        if (error) return;
        if (!imageUrl) return;

        fabric.Image.fromURL(
          imageUrl,
          (image) => {
            console.log(image);
            const workspace = getWorkspace();

            const assetId = generateAlphanumericHash();

            image.set({
              options: {
                bg: rgbaToHex(bgcolor || "ffffff"),
                fg: rgbaToHex(color || "000000"),
                barCodeType: type,
                isBarCode: true,
                value,
                barCodeFunction,
                assetId,
              },
            });

            console.log(image.options?.isBarCode);

            // image.scaleToWidth(workspace?.width || 0);
            // image.scaleToHeight(workspace?.height || 0);

            addToCanvas(image);
          },
          {
            crossOrigin: "anonymous",
          }
        );

        // fabric.Image.fromURL(
        //   "https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=svg" +
        //     "&bgcolor=" +
        //     (rgbaToHex(bgcolor) || "#ffffff") +
        //     "&color=" +
        //     (rgbaToHex(color) || "#000000") +
        //     "&data=" +
        //     encodeURIComponent(value),
        //   (image: fabric.Image) => {
        //     console.log(image);
        //     const workspace = getWorkspace();

        //     // image.scaleToWidth(workspace?.width || 0);
        //     // image.scaleToHeight(workspace?.height || 0);

        //     addToCanvas(image);
        //   },
        //   {
        //     crossOrigin: "anonymous",
        //   }
        // );
      } catch (error) {
        console.log(error);
      }
    },
    transformBarCodes: async () => {
      const objects = canvas
        .getObjects()
        // .forEach((object) => console.log(object.isBarCode))
        .filter(
          (object) =>
            object instanceof fabric.Image && object.options?.isBarCode
        );

      for (const object of objects) {
        try {
          console.log(object.options);
          let text = object.options?.value;

          // if (object.options?.barCodeFunction === "verify") {
          //   text = `https://credentials.zikoro.com/credentials/verify/certificate/${certificate.certificateId}`;
          // }

          // if (object.options?.barCodeFunction === "attribute") {
          //   text = certificate?.metadata[object.options?.value];
          // }

          console.log(text);

          const url = `https://barcodeapi.org/api/${
            object.options?.barCodeType
          }/${encodeURIComponent(text)}`;

          console.log(url);
          const response = await fetch(url, { cache: "no-store" });

          const tokens = response.headers.get("X-RateLimit-Tokens");
          console.log("Tokens remaining: " + tokens);

          const blob = await response.blob();

          const blobUrl = new File(
            [blob],
            object.options?.type +
              ":" +
              object.options?.value +
              new Date().getUTCMilliseconds() +
              ".png",
            {
              type: blob.type,
              lastModified: Date.now(),
            }
          );

          const { url: imageUrl, error } = await uploadFile(blobUrl, "image");

          console.log(imageUrl);

          if (error) return;
          if (!imageUrl) return;

          object.set({
            src: imageUrl,
          });

          object.setSrc(
            imageUrl,
            function (img) {
              console.log(img.src);
              canvas.renderAll();
            },
            {
              crossOrigin: "anonymous",
            }
          );

          // oldImage.set({
          //   src: imageUrl,
          // })

          // canvas.renderAll();

          // fabric.Image.fromURL(
          //   imageUrl,
          //   (newImg) => {
          //     newImg.set({
          //       left: object.left,
          //       top: object.top,
          //       angle: object.angle,
          //       scaleX: object.scaleX,
          //       scaleY: object.scaleY,
          //       opacity: object.opacity,
          //       flipX: object.flipX,
          //       flipY: object.flipY,
          //     });

          //     console.log(newImg.src, object.options.value);
          //     // Replace the old image with the new one
          //     // canvas.remove(oldImage);
          //     canvas.remove(object);
          //     addToCanvas(newImg);

          //   },
          //   {
          //     crossOrigin: "anonymous",
          //   }
          // );// fabric.Image.fromURL(
          //   imageUrl,
          //   (newImg) => {
          //     newImg.set({
          //       left: object.left,
          //       top: object.top,
          //       angle: object.angle,
          //       scaleX: object.scaleX,
          //       scaleY: object.scaleY,
          //       opacity: object.opacity,
          //       flipX: object.flipX,
          //       flipY: object.flipY,
          //     });

          //     console.log(newImg.src, object.options.value);
          //     // Replace the old image with the new one
          //     // canvas.remove(oldImage);
          //     canvas.remove(object);
          //     addToCanvas(newImg);

          //   },
          //   {
          //     crossOrigin: "anonymous",
          //   }
          // );
        } catch (error) {
          console.log(error);
        }
      }
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

        console.log("object", object);
        canvas.remove(object);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
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
      canvas.getActiveObjects().forEach((object: fabric.Object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontSize exists.
          object.set({ fontSize: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_SIZE;
      }

      // @ts-ignore
      // Faulty TS library, fontSize exists.
      const value = selectedObject.get("fontSize") || FONT_SIZE;

      return value;
    },
    changeTextAlign: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, textAlign exists.
          object.set({ textAlign: value });
        }
      });
      canvas.renderAll();
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "left";
      }

      // @ts-ignore
      // Faulty TS library, textAlign exists.
      const value = selectedObject.get("textAlign") || "left";

      return value;
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, underline exists.
          object.set({ underline: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, underline exists.
      const value = selectedObject.get("underline") || false;

      return value;
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, linethrough exists.
          object.set({ linethrough: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, linethrough exists.
      const value = selectedObject.get("linethrough") || false;

      return value;
    },
    changeFontStyle: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontStyle exists.
          object.set({ fontStyle: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "normal";
      }

      // @ts-ignore
      // Faulty TS library, fontStyle exists.
      const value = selectedObject.get("fontStyle") || "normal";

      return value;
    },
    changeFontWeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontWeight exists.
          object.set({ fontWeight: value });
        }
      });
      canvas.renderAll();
    },
    changeOpacity: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity: value });
      });
      canvas.renderAll();
    },
    bringForward: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.bringForward(object);
      });

      canvas.renderAll();

      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    sendBackwards: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.sendBackwards(object);
      });

      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    changeFontFamily: (value: string) => {
      setFontFamily(value);
      canvas.getActiveObjects().forEach((object: fabric.Object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontFamily exists.
          object.set({ fontFamily: value });
        }
      });
      canvas.renderAll();
    },
    changeFillColor: (value: string) => {
      setFillColor(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: value });
      });
      canvas.renderAll();
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value);
      canvas.getActiveObjects().forEach((object) => {
        // Text types don't have stroke
        if (isTextType(object.type)) {
          object.set({ fill: value });
          return;
        }

        object.set({ stroke: value });
      });
      canvas.freeDrawingBrush.color = value;
      canvas.renderAll();
    },
    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: value });
      });
      canvas.freeDrawingBrush.width = value;
      canvas.renderAll();
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: value });
      });
      canvas.renderAll();
    },
    addHorizontalLine: () => {
      const object = new fabric.Line([50, 100, 250, 100], {
        stroke: strokeColor,
      });

      addToCanvas(object);
    },
    addVerticalLine: () => {
      const object = new fabric.Line([150, 50, 150, 250], {
        stroke: strokeColor,
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
      // Faulty TS library, fontWeight exists.
      const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

      return value;
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fontFamily;
      }

      // @ts-ignore
      // Faulty TS library, fontFamily exists.
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

  // useSmartGuides(canvas, {});

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
        strokeColor,
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

      // initCenteringGuidelines(initialCanvas);
      // initAligningGuidelines(initialCanvas);

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      // initialCanvas
      //   .getObjects()
      //   .filter(
      //     (object) => object instanceof fabric.Image && object.isBackground
      //   )
      //   .forEach((bgImage) => {
      //     console.log("here");
      //     initialCanvas.sendToBack(bgImage);
      //     bgImage.scaleToWidth(initialWorkspace.width || 1200);
      //     bgImage.scaleToHeight(initialWorkspace.height || 900);
      //     initialCanvas.renderAll();
      //   });

      const currentState = JSON.stringify(initialCanvas.toJSON(JSON_KEYS));
      canvasHistory.current = [currentState];
      setHistoryIndex(0);
    },
    [
      canvasHistory, // No need, this is from useRef
      setHistoryIndex, // No need, this is from useState
    ]
  );

  return { init, editor };
};
