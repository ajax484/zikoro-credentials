import { fabric } from "fabric";
import { useEffect, useRef } from "react";

import { JSON_KEYS } from "@/components/editor/types";
import { nanoid } from "nanoid";

interface UseLoadStateProps {
  autoZoom: () => void;
  canvas: fabric.Canvas | null;
  initialState: React.MutableRefObject<string | undefined>;
  canvasHistory: React.MutableRefObject<string[]>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const useLoadState = ({
  canvas,
  autoZoom,
  initialState,
  canvasHistory,
  setHistoryIndex,
}: UseLoadStateProps) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialState?.current && canvas) {
      console.log(initialState.current);
      const data = JSON.parse(initialState.current);

      console.log(data);

      canvas.loadFromJSON(data, () => {
        const currentState = JSON.stringify(canvas.toJSON(JSON_KEYS));

        canvas.forEachObject((object) => {
          object.set({
            objectId: nanoid(),
          });

          console.log(object.objectId);
        });

        canvas.renderAll();

        canvasHistory.current = [currentState];
        setHistoryIndex(0);
        autoZoom();
      });
      initialized.current = true;
    }
  }, [
    canvas,
    autoZoom,
    initialState, // no need, this is a ref
    canvasHistory, // no need, this is a ref
    setHistoryIndex, // no need, this is a dispatch
  ]);
};
