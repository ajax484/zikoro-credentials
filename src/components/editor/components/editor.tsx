"use client";

import { fabric } from "fabric";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useRef, useState } from "react";

import { ActiveTool, selectionDependentTools } from "@/components/editor/types";
import { Navbar } from "@/components/editor/components/navbar";
import { Footer } from "@/components/editor/components/footer";
import { useEditor } from "@/components/editor/hooks/use-editor";
import { Sidebar } from "@/components/editor/components/sidebar";
import { Toolbar } from "@/components/editor/components/toolbar";
import { ShapeSidebar } from "@/components/editor/components/shape-sidebar";
import { FillColorSidebar } from "@/components/editor/components/fill-color-sidebar";
import { StrokeColorSidebar } from "@/components/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/components/editor/components/stroke-width-sidebar";
import { OpacitySidebar } from "@/components/editor/components/opacity-sidebar";
import { TextSidebar } from "@/components/editor/components/text-sidebar";
import { FontSidebar } from "@/components/editor/components/font-sidebar";
import { ImageSidebar } from "@/components/editor/components/image-sidebar";
import { FilterSidebar } from "@/components/editor/components/filter-sidebar";
import { DrawSidebar } from "@/components/editor/components/draw-sidebar";
import { SettingsSidebar } from "@/components/editor/components/settings-sidebar";
import { BackgroundSidebar } from "./background-sidebar";
import { VerificationSidebar } from "./verification-sidebar";

import { QRCodeSidebar } from "./qrcode-sidebar";
import { base64ToFile, uploadFile } from "@/utils/helpers";
import { CredentialsWorkspaceToken } from "@/types/token";
import { TemplateSidebar } from "./template-sidebar";

interface EditorProps {
  initialData: ResponseType["data"];
  name: string;
  setName: (name: string) => void;
  workspaceId: string;
  workspaceAlias: string;
  save: (
    values: { json: string; height: number; width: number },
    url: string
  ) => void;
  isSaving: boolean;
  isError: boolean;
  settings: any;
  setSettings: (settings: any) => void;
  type: "certificate" | "badge";
  alias: string;
  getCredits: () => Promise<CredentialsWorkspaceToken[] | undefined>;
  creditBalance: {
    bronze: number;
    silver: number;
    gold: number;
  };
  credentialId: number;
  chargeCredits: ({
    payload,
  }: {
    payload: {
      amountToCharge: number;
      activityBy: number;
      credentialId: number;
      workspaceId: number;
      tokenId: number;
    };
  }) => Promise<void>;
  isMutating: boolean;
  creditsIsLoading: boolean;
  attributes: string[];
  setAttributes: React.Dispatch<React.SetStateAction<string[]>>;
  toggleQRCode: (value: boolean) => void;
  hasQRCode: boolean;
}

export const Editor = ({
  initialData,
  name,
  setName,
  workspaceId,
  workspaceAlias,
  save,
  isSaving,
  isError,
  settings,
  setSettings,
  type,
  alias,
  getCredits,
  creditBalance,
  credentialId,
  chargeCredits,
  isMutating,
  creditsIsLoading,
  attributes,
  setAttributes,
  toggleQRCode,
  hasQRCode,
}: EditorProps) => {
  // const { mutate } = useUpdateProject(initialData.id);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(
      async (values: { json: string; height: number; width: number }) => {
        console.log("here");
        const imageURL = editor?.generateLink();
        if (!imageURL) return;
        // save(values, imageURL);
      },
      1500
    ),
    [save]
  );

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData?.json,
    defaultWidth: initialData?.width ?? 900,
    defaultHeight: initialData?.height ?? 1200,
    clearSelectionCallback: onClearSelection,
    saveCallback: debouncedSave,
    toggleQRCode,
  });

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") {
        editor?.enableDrawingMode();
      }

      if (activeTool === "draw") {
        editor?.disableDrawingMode();
      }

      if (tool === activeTool) {
        return setActiveTool("select");
      }

      setActiveTool(tool);
    },
    [activeTool, editor]
  );

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="flex h-full flex-col">
      <Navbar
        alias={alias}
        id={initialData?.id ?? 1}
        editor={editor}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        setName={(name) => {
          setName(name);
          debouncedSave();
        }}
        save={debouncedSave}
        name={name}
        isSaving={isSaving}
        isError={isError}
        type={type}
      />
      <div className="absolute top-[68px] flex h-[calc(100%-68px)] w-full">
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <QRCodeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          getCredits={getCredits}
          creditBalance={creditBalance}
          credentialId={credentialId}
          workspaceId={workspaceId}
          chargeCredits={chargeCredits}
          isMutating={isMutating}
          creditsIsLoading={creditsIsLoading}
          type={type}
          workspaceAlias={workspaceAlias}
          toggleQRCode={toggleQRCode}
          hasQRCode={hasQRCode}
        />
        <VerificationSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          attributes={attributes}
          setAttributes={setAttributes}
          save={debouncedSave}
          isSaving={isSaving}
        />
        <FontSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <BackgroundSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          organizationId={workspaceId}
        />
        <ImageSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          organizationId={workspaceId}
        />
        <TemplateSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        {/* <AiSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        /> */}
        {/* <RemoveBgSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        /> */}
        <DrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <SettingsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          onChangeSettings={(value: any) => {
            setSettings((prev) => ({ ...prev, ...value }));
          }}
          saveSettings={debouncedSave}
          settings={settings}
          isSaving={isSaving}
        />
        <main className="relative flex flex-1 flex-col overflow-auto bg-muted">
          <Toolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />
          <div
            className="h-[calc(100%-124px)] flex-1 bg-muted"
            ref={containerRef}
          >
            <canvas ref={canvasRef} />
          </div>
          <Footer
            workspaceId={workspaceId}
            editor={editor}
            getCredits={getCredits}
            creditBalance={creditBalance}
          />
        </main>
      </div>
    </div>
  );
};
