import { useEffect, useRef } from "react";
import { isShallowEqual } from "@excalidraw/common";
import { isGridModeEnabled } from "@excalidraw/excalidraw/snapping";

import type App from "@excalidraw/excalidraw/components/App";
import type {
  NonDeletedExcalidrawElement,
  NonDeletedSceneElementsMap,
} from "@excalidraw/element/types";

import { renderStaticScene } from "../../renderer/staticScene";

import type {
  RenderableElementsMap,
  StaticCanvasRenderConfig,
} from "../../scene/types";
import type { AppState, StaticCanvasAppState } from "../../types";

type StaticCanvasProps = {
  app: App;
};

type RenderingProps = {
  elementsMap: RenderableElementsMap;
  allElementsMap: NonDeletedSceneElementsMap;
  visibleElements: readonly NonDeletedExcalidrawElement[];
  sceneNonce: number | undefined;
  selectionNonce: number | undefined;
  appState: StaticCanvasAppState;
  renderConfig: StaticCanvasRenderConfig;
};

const StaticCanvas = (props: StaticCanvasProps) => {
  const { app } = props;
  const scale = window.devicePixelRatio;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const renderingProps = useRef<RenderingProps | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }
    wrapper.replaceChildren(app.canvas);
    app.canvas.classList.add("excalidraw__canvas", "static");
  }, [app.canvas]);

  useEffect(() => {
    const unsub = excalidrawAPI.onRenderTrigger((appState: AppState) => {
      if (
        appState.height !== renderingProps.current?.appState.height ||
        appState.width !== renderingProps.current?.appState.width
      ) {
        app.canvas.style.width = `${appState.width}px`;
        app.canvas.style.height = `${appState.height}px`;
        app.canvas.width = appState.width * scale;
        app.canvas.height = appState.height * scale;
      }

      const { elementsMap, visibleElements } =
        app.renderer.getRenderableElements({
          sceneNonce: app.scene.getSceneNonce(),
          zoom: appState.zoom,
          offsetLeft: appState.offsetLeft,
          offsetTop: appState.offsetTop,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          height: appState.height,
          width: appState.width,
          editingTextElement: appState.editingTextElement,
          newElementId: appState.newElement?.id,
        });

      const nextRenderingProps = {
        allElementsMap: app.scene.getNonDeletedElementsMap(),
        visibleElements,
        appState,
        elementsMap,
        sceneNonce: app.scene.getSceneNonce(),
        selectionNonce: appState.selectionElement?.versionNonce,
        renderConfig: {
          imageCache: app.imageCache,
          isExporting: false,
          renderGrid: isGridModeEnabled({
            props: { gridModeEnabled: app.props.gridModeEnabled },
            state: { gridModeEnabled: appState.gridModeEnabled },
          }),
          canvasBackgroundColor: appState.viewBackgroundColor,
          embedsValidationStatus: app.embedsValidationStatus,
          elementsPendingErasure: app.elementsPendingErasure,
          pendingFlowchartNodes: app.flowChartCreator.pendingNodes,
        },
      };

      if (
        !renderingProps.current ||
        areRenderingPropsEqual(renderingProps.current, nextRenderingProps)
      ) {
        renderStaticScene({
          ...nextRenderingProps,
          canvas: app.canvas,
          rc: app.rc,
          scale,
        });
      }

      renderingProps.current = nextRenderingProps;
    });
    return unsub;
  }, [app, scale]);

  return <div className="excalidraw__canvas-wrapper" ref={wrapperRef} />;
};

const getRelevantAppStateProps = (appState: AppState): StaticCanvasAppState => {
  const relevantAppStateProps = {
    zoom: appState.zoom,
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
    width: appState.width,
    height: appState.height,
    viewModeEnabled: appState.viewModeEnabled,
    openDialog: appState.openDialog,
    hoveredElementIds: appState.hoveredElementIds,
    offsetLeft: appState.offsetLeft,
    offsetTop: appState.offsetTop,
    theme: appState.theme,
    shouldCacheIgnoreZoom: appState.shouldCacheIgnoreZoom,
    viewBackgroundColor: appState.viewBackgroundColor,
    exportScale: appState.exportScale,
    selectedElementsAreBeingDragged: appState.selectedElementsAreBeingDragged,
    gridSize: appState.gridSize,
    gridStep: appState.gridStep,
    frameRendering: appState.frameRendering,
    selectedElementIds: appState.selectedElementIds,
    frameToHighlight: appState.frameToHighlight,
    editingGroupId: appState.editingGroupId,
    currentHoveredFontFamily: appState.currentHoveredFontFamily,
    croppingElementId: appState.croppingElementId,
  };

  return relevantAppStateProps;
};

const areRenderingPropsEqual = (
  prevProps: RenderingProps,
  nextProps: RenderingProps,
) => {
  if (
    prevProps.sceneNonce !== nextProps.sceneNonce ||
    // we need to memoize on elementsMap because they may have renewed
    // even if sceneNonce didn't change (e.g. we filter elements out based
    // on appState)
    prevProps.elementsMap !== nextProps.elementsMap ||
    prevProps.visibleElements !== nextProps.visibleElements
  ) {
    return false;
  }

  return (
    isShallowEqual(
      // asserting AppState because we're being passed the whole AppState
      // but resolve to only the StaticCanvas-relevant props
      getRelevantAppStateProps(prevProps.appState as AppState),
      getRelevantAppStateProps(nextProps.appState as AppState),
    ) && isShallowEqual(prevProps.renderConfig, nextProps.renderConfig)
  );
};

export default StaticCanvas;
