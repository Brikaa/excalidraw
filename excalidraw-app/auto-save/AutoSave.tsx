import { memo, useEffect, useRef } from "react";
import { FileHandleIDB } from "excalidraw-app/data/LocalData";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export interface AutoSaveProps {
  excalidrawAPI: ExcalidrawImperativeAPI;
}

export const AutoSave = memo((props: AutoSaveProps) => {
  const { excalidrawAPI } = props;
  const fileHandle = useRef(excalidrawAPI.getAppState().fileHandle);

  useEffect(() => {
    const unsubOnChange = excalidrawAPI.onChange(async (_, appState) => {
      if (appState.fileHandle !== fileHandle.current && !appState.isLoading) {
        const res = await FileHandleIDB.save(appState.fileHandle);
        fileHandle.current = appState.fileHandle;
        console.log("Saved", res);
      }
    });

    return unsubOnChange;
  }, [excalidrawAPI]);
  return null;
});
