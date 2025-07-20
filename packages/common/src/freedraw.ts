import type { ExcalidrawFreeDrawElement } from "@excalidraw/element/types";

import type { StrokeOptions } from "perfect-freehand";

export const getFreeDrawOptions = (element: ExcalidrawFreeDrawElement) => {
  const options: StrokeOptions = {
    simulatePressure: element.simulatePressure,
    size: element.strokeWidth * 4.25,
    thinning: 0.6,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t) => Math.sin((t * Math.PI) / 2), // https://easings.net/#easeOutSine
    last: !!element.lastCommittedPoint, // LastCommittedPoint is added on pointerup
  };
  return options;
};
