import { fabric } from "fabric";
import { ITextboxOptions } from "fabric/fabric-impl";
import * as material from "material-colors";
import { barCodeTypeEnum } from "./components/qrcode-sidebar";
import { z } from "zod";

export const JSON_KEYS = [
  "name",
  "gradientAngle",
  "selectable",
  "hasControls",
  "linkData",
  "editable",
  "extensionType",
  "extension",
  "options",
  "isBackground",
  "objectId",
  "objectName",
  "locked",
  "borderRadius",
  "isSVG",
];

export const filters = [
  "none",
  "polaroid",
  "sepia",
  "kodachrome",
  "contrast",
  "brightness",
  "greyscale",
  "brownie",
  "vintage",
  "technicolor",
  "pixelate",
  "invert",
  "blur",
  "sharpen",
  "emboss",
  "removecolor",
  "blacknwhite",
  "vibrance",
  "blendcolor",
  "huerotate",
  "resize",
  "saturation",
  "gamma",
];

export const fonts = [
  "Arial",
  "Arial Black",
  "Verdana",
  "Helvetica",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Courier New",
  "Brush Script MT",
  "Palatino",
  "Bookman",
  "Comic Sans MS",
  "Impact",
  "Lucida Sans Unicode",
  "Geneva",
  "Lucida Console",
];

export const selectionDependentTools = [
  "fill",
  "font",
  "filter",
  "opacity",
  "remove-bg",
  "stroke-color",
  "stroke-width",
];

export const COLORS: string[] = [
  material.black,
  material.white,
  material.red["500"],
  material.pink["500"],
  material.purple["500"],
  material.deepPurple["500"],
  material.indigo["500"],
  material.blue["500"],
  material.lightBlue["500"],
  material.cyan["500"],
  material.teal["500"],
  material.green["500"],
  material.lightGreen["500"],
  material.lime["500"],
  material.yellow["500"],
  material.amber["500"],
  material.orange["500"],
  material.deepOrange["500"],
  material.brown["500"],
  material.blueGrey["500"],
  "transparent",
];

export type ActiveTool =
  | "select"
  | "shapes"
  | "text"
  | "images"
  | "draw"
  | "fill"
  | "svg-fill"
  | "stroke-color"
  | "stroke-width"
  | "font"
  | "opacity"
  | "filter"
  | "settings"
  | "ai"
  | "remove-bg"
  | "templates"
  | "background"
  | "verification"
  | "qrCode"
  | "layers"
  | "border-radius"
  | "alignment";

export const FILL_COLOR = "rgba(0,0,0,1)";
export const STROKE_COLOR = "rgba(0,0,0,1)";
export const STROKE_WIDTH = 2;
export const BORDER_RADIUS = 50;
export const STROKE_DASH_ARRAY = [];
export const FONT_FAMILY = "Arial";
export const FONT_SIZE = 32;
export const FONT_WEIGHT = 400;

export const CIRCLE_OPTIONS = {
  radius: 225,
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
};

export const RECTANGLE_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 400,
  height: 400,
  angle: 0,
};

export const DIAMOND_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 600,
  height: 600,
  angle: 0,
};

export const TRIANGLE_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 400,
  height: 400,
  angle: 0,
};

export const TEXT_OPTIONS = {
  type: "textbox",
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  fontSize: FONT_SIZE,
  fontFamily: FONT_FAMILY,
};

export interface EditorHookProps {
  defaultState?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  clearSelectionCallback?: () => void;
  saveCallback?: (values: {
    json: string;
    height: number;
    width: number;
  }) => void;
  toggleQRCode: (value: boolean) => void;
  smartGuides?: boolean;
}

export type BuildEditorProps = {
  undo: () => void;
  redo: () => void;
  save: (skip?: boolean) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  autoZoom: () => void;
  copy: () => void;
  paste: () => void;
  canvas: fabric.Canvas;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
  selectedObjects: fabric.Object[];
  strokeDashArray: number[];
  fontFamily: string;
  setStrokeDashArray: (value: number[]) => void;
  setFillColor: (value: string) => void;
  setStrokeColor: (value: string) => void;
  setStrokeWidth: (value: number) => void;
  setFontFamily: (value: string) => void;
  toggleQRCode: (value: boolean) => void;
  setBorderRadius: (value: number) => void;
};

export interface Editor {
  generateLinkAsync: (
    next?: (url: string) => void,
    isLive?: boolean
  ) => Promise<string>;
  generateLink: (isLive?: boolean) => string;
  savePdf: (
    { width, height }: { width: number; height: number },
    name?: string
  ) => void;
  printPdf: (
    { width, height }: { width: number; height: number },
    name?: string
  ) => void;
  savePng: (name?: string) => void;
  saveJpg: (name?: string) => void;
  saveSvg: (name?: string) => void;
  saveJson: () => void;
  loadJson: (json: string) => void;
  loadJsonAsync: (json: string) => Promise<string>;
  loadMultipleJsonAsync: (
    jsonDataArray: Array<{ json: string; width: number; height: number }>
  ) => Promise<string[]>;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  autoZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getWorkspace: () => fabric.Object | undefined;
  changeBackgroundImage: (image: string) => void;
  changeBackground: (value: string) => void;
  changeSize: (value: { width: number; height: number }) => void;
  enableDrawingMode: () => void;
  disableDrawingMode: () => void;
  onCopy: () => void;
  onPaste: () => void;
  changeImageFilter: (value: string) => void;
  addImage: (value: string) => void;
  changeImage: (value: string) => void;
  addBackgroundImage: (value: string) => void;
  addQRCode: (
    value: string,
    color: string,
    bgcolor: string,
    type: z.infer<typeof barCodeTypeEnum>,
    barCodeFunction: string
  ) => Promise<void>;
  addEditableSVG: (svgString: string, options?: fabric.IObjectOptions) => void;
  transformBarCodes: () => Promise<void>;
  delete: () => void;
  changeAlignment: (
    position:
      | "top-left"
      | "top-center"
      | "top-right"
      | "middle-left"
      | "middle-center"
      | "middle-right"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right",
    object?: fabric.Object
  ) => void;
  flipShape: (
    flipX: boolean | null,
    flipY: boolean | null,
    object?: fabric.Object
  ) => void;
  groupObjects: () => void;
  ungroupObjects: () => void;
  getAllObjects: () => fabric.Object[];
  selectObject: (object: fabric.Object) => void;
  getActiveObject: () => fabric.Object | null;
  deleteObject: (object: fabric.Object) => void;
  updateObject: (object: fabric.Object, options: Record<string, any>) => void;
  lockSelectedObjects: (object?: fabric.Object) => void;
  unlockSelectedObjects: (object?: fabric.Object) => void;
  changeFontSize: (value: number) => void;
  getActiveFontSize: () => number;
  changeTextAlign: (value: string) => void;
  getActiveTextAlign: () => string;
  changeFontUnderline: (value: boolean) => void;
  getActiveFontUnderline: () => boolean;
  changeFontLinethrough: (value: boolean) => void;
  getActiveFontLinethrough: () => boolean;
  changeFontStyle: (value: string) => void;
  getActiveFontStyle: () => string;
  getActiveBorderRadius: () => number;
  changeFontWeight: (value: number) => void;
  getActiveFontWeight: () => number;
  getActiveFontFamily: () => string;
  changeFontFamily: (value: string) => void;
  changeBorderRadius: (value: number) => void;
  addText: (value: string, options?: ITextboxOptions) => void;
  getActiveOpacity: () => number;
  changeOpacity: (value: number) => void;
  bringForward: (obj?: fabric.Object) => void;
  sendBackwards: (obj?: fabric.Object) => void;
  moveObjectToIndex: (obj: fabric.Object, targetIndex: number) => void;
  clear: () => void;
  changeStrokeWidth: (value: number) => void;
  changeFillColor: (value: string, object?: fabric.Object) => void;
  changeStrokeColor: (value: string) => void;
  changeStrokeDashArray: (value: number[]) => void;
  addHorizontalLine: () => void;
  addVerticalLine: () => void;
  addCircle: () => void;
  addSoftRectangle: () => void;
  addRectangle: () => void;
  addTriangle: () => void;
  addInverseTriangle: () => void;
  addDiamond: () => void;
  canvas: fabric.Canvas;
  getActiveFillColor: () => string;
  getActiveStrokeColor: () => string;
  getActiveStrokeWidth: () => number;
  getActiveStrokeDashArray: () => number[];
  selectedObjects: fabric.Object[];
}

export type SmartGuideOptions = {
  snapThreshold?: number;
  guideColor?: string;
  guideWidth?: number;
};

export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SnappingLines = {
  vertical: fabric.Line[];
  horizontal: fabric.Line[];
};

export type OrientationType = "vertical" | "horizontal";
export type AlignmentType =
  | "left"
  | "right"
  | "centerX"
  | "top"
  | "bottom"
  | "centerY";
