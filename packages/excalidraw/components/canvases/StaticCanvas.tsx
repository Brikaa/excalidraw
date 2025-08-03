import React, { useEffect, useRef } from "react";

import { isShallowEqual } from "@excalidraw/common";

import type { Renderer } from "@excalidraw/excalidraw/scene/Renderer";

import type { Scene } from "@excalidraw/element";

import type {
  NonDeletedExcalidrawElement,
  NonDeletedSceneElementsMap,
} from "@excalidraw/element/types";

import { isRenderThrottlingEnabled } from "../../reactUtils";
import { renderStaticScene } from "../../renderer/staticScene";

import type {
  RenderableElementsMap,
  StaticCanvasRenderConfig,
} from "../../scene/types";
import type { AppState, StaticCanvasAppState } from "../../types";
import type { RoughCanvas } from "roughjs/bin/canvas";

type StaticCanvasProps = {
  renderer: Renderer;
  canvas: HTMLCanvasElement;
  rc: RoughCanvas;
  scale: number;
  renderConfig: StaticCanvasRenderConfig;
};

type RenderingProps = {
  elementsMap: RenderableElementsMap;
  allElementsMap: NonDeletedSceneElementsMap;
  visibleElements: readonly NonDeletedExcalidrawElement[];
  sceneNonce: number | undefined;
  selectionNonce: number | undefined;
  appState: StaticCanvasAppState;
};

const StaticCanvas = (props: StaticCanvasProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const renderingProps = useRef<RenderingProps | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    const canvas = props.canvas;

    wrapper.replaceChildren(canvas);
    canvas.classList.add("excalidraw__canvas", "static");
  }, [props.canvas]);

  useEffect(() => {
    const unsub = excalidrawAPI.onRenderTrigger(
      (appState: AppState, scene: Scene) => {
        if (
          appState.height !== renderingProps.current?.appState.height ||
          appState.width !== renderingProps.current?.appState.width
        ) {
          props.canvas.style.width = `${appState.width}px`;
          props.canvas.style.height = `${appState.height}px`;
          props.canvas.width = appState.width * props.scale;
          props.canvas.height = appState.height * props.scale;
        }

        const { elementsMap, visibleElements } =
          props.renderer.getRenderableElements({
            sceneNonce: scene.getSceneNonce(),
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
          allElementsMap: scene.getNonDeletedElementsMap(),
          visibleElements,
          appState,
          elementsMap,
          sceneNonce: scene.getSceneNonce(),
          selectionNonce: appState.selectionElement?.versionNonce,
        };

        if (
          !renderingProps.current ||
          areRenderingPropsEqual(renderingProps.current, nextRenderingProps)
        ) {
          renderStaticScene(
            {
              ...nextRenderingProps,
              ...props,
            },
            isRenderThrottlingEnabled(),
          );
        }

        renderingProps.current = nextRenderingProps;
      },
    );
    return unsub;
  }, [
    props,
    props.canvas,
    props.rc,
    props.renderConfig,
    props.renderer,
    props.scale,
  ]);

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

  return isShallowEqual(
    // asserting AppState because we're being passed the whole AppState
    // but resolve to only the StaticCanvas-relevant props
    getRelevantAppStateProps(prevProps.appState as AppState),
    getRelevantAppStateProps(nextProps.appState as AppState),
  );
};

const arePropsEqual = (
  prevProps: StaticCanvasProps,
  nextProps: StaticCanvasProps,
) => {
  const { renderConfig: prevRenderConfig, ...prevRest } = prevProps;
  const { renderConfig: nextRenderConfig, ...nextRest } = nextProps;
  return (
    isShallowEqual(prevRest, nextRest) &&
    isShallowEqual(prevRenderConfig, nextRenderConfig)
  );
};

export default React.memo(StaticCanvas, arePropsEqual);
