import { memo, useEffect, useRef } from "react";
import { FileHandleIDB } from "excalidraw-app/data/LocalData";
import { debounce } from "@excalidraw/common";
import { saveAsJSON } from "@excalidraw/excalidraw/data";

import type { FileSystemHandle } from "@excalidraw/excalidraw/data/filesystem";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const AUTO_SAVE_PERIOD = 3000;

const save = debounce(
  async (
    excalidrawAPI: ExcalidrawImperativeAPI,
    fileHandle: FileSystemHandle,
  ) => {
    const permission = await fileHandle.queryPermission({ mode: "readwrite" });
    if (permission !== "granted") {
      console.log("Need to show indicator");
    } else {
      await saveAsJSON(
        excalidrawAPI.getSceneElements(),
        excalidrawAPI.getAppState(),
        excalidrawAPI.getFiles(),
        excalidrawAPI.getName(),
      );
    }
  },
  AUTO_SAVE_PERIOD,
);

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

    const unsubOnIncrement = excalidrawAPI.onIncrement((event) => {
      if (fileHandle.current && Object.keys(event.change.elements).length) {
        save(excalidrawAPI, fileHandle.current);
      }
    });

    return () => {
      unsubOnChange();
      unsubOnIncrement();
    };
  }, [excalidrawAPI]);
  return null;
});
