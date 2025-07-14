import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FileHandleIDB } from "excalidraw-app/data/LocalData";
import { debounce } from "@excalidraw/common";
import { ExportIcon } from "@excalidraw/excalidraw/components/icons";

import type { FileSystemHandle } from "@excalidraw/excalidraw/data/filesystem";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const AUTO_SAVE_PERIOD = 3000;

const save = debounce(
  async (
    excalidrawAPI: ExcalidrawImperativeAPI,
    fileHandle: FileSystemHandle,
    showIndicator: () => void,
  ) => {
    const permission = await fileHandle.queryPermission({ mode: "readwrite" });
    if (permission !== "granted") {
      console.log("Showing indicator");
      showIndicator();
    } else {
      try {
        await excalidrawAPI.saveToFile();
        console.log("Saved");
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error(error);
        } else {
          console.warn(error);
        }
      }
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

  const [showIndicator, setShowIndicator] = useState(false);

  const handleIndicatorClick = useCallback(async () => {
    if (fileHandle.current) {
      const permission = await fileHandle.current.requestPermission({
        mode: "readwrite",
      });
      if (permission === "granted") {
        await excalidrawAPI.saveToFile();
        setShowIndicator(false);
      }
    } else {
      await excalidrawAPI.saveToFile();
      setShowIndicator(false);
    }
  }, [excalidrawAPI]);

  useEffect(() => {
    const unsubOnChange = excalidrawAPI.onChange(async (_, appState) => {
      if (appState.fileHandle !== fileHandle.current && !appState.isLoading) {
        await FileHandleIDB.save(appState.fileHandle);
        fileHandle.current = appState.fileHandle;
        if (appState.fileHandle === null) {
          setShowIndicator(false);
        }
        console.log("Changed file handle");
      }
    });

    return unsubOnChange;
  }, [excalidrawAPI]);

  useEffect(() => {
    const unsubOnIncrement = excalidrawAPI.onIncrement((event) => {
      if (
        fileHandle.current &&
        Object.keys(event.change.elements).length &&
        !showIndicator
      ) {
        save(excalidrawAPI, fileHandle.current, () => setShowIndicator(true));
      }
    });
    return unsubOnIncrement;
  }, [excalidrawAPI, showIndicator]);

  return (
    <>
      {showIndicator && (
        <div className="auto-save-indicator" onClick={handleIndicatorClick}>
          {ExportIcon}
        </div>
      )}
    </>
  );
});
