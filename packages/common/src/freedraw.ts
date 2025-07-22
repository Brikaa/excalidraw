import { getStroke, type StrokeOptions } from "perfect-freehand";

import type { LocalPoint } from "@excalidraw/math";
import type { ExcalidrawFreeDrawElement } from "@excalidraw/element/types";

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

export class StrokeCache {
  public static cache = new WeakMap<ExcalidrawFreeDrawElement, LocalPoint[]>();
}

export const getFreeDrawStroke = (element: ExcalidrawFreeDrawElement) => {
  const cachedStroke = StrokeCache.cache.get(element);
  if (cachedStroke) {
    return cachedStroke;
  }

  const inputPoints = element.simulatePressure
    ? element.points
    : element.points.length
    ? element.points.map(([x, y], i) => [x, y, element.pressures[i]])
    : [[0, 0, 0.5]];
  const stroke = getStroke(
    inputPoints as LocalPoint[],
    getFreeDrawOptions(element),
  ) as LocalPoint[];
  StrokeCache.cache.set(element, stroke);
  return stroke;
};
