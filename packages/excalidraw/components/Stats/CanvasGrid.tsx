import type App from "@excalidraw/excalidraw/components/App";

import type { Scene } from "@excalidraw/element";

import { getNormalizedGridStep } from "../../scene";

import StatsDragInput from "./DragInput";
import { getStepSizedValue } from "./utils";

import type { AppState } from "../../types";

interface PositionProps {
  property: "gridStep";
  scene: Scene;
  appState: AppState;
  setAppState: App["setState"];
}

const STEP_SIZE = 5;

const CanvasGrid = ({
  property,
  scene,
  appState,
  setAppState,
}: PositionProps) => {
  return (
    <StatsDragInput
      label="Grid step"
      sensitivity={8}
      elements={[]}
      dragInputCallback={({
        nextValue,
        instantChange,
        shouldChangeByStepSize,
        setInputValue,
      }) => {
        let nextGridStep;

        if (nextValue) {
          nextGridStep = nextValue;
        } else if (instantChange) {
          nextGridStep = shouldChangeByStepSize
            ? getStepSizedValue(
                appState.gridStep + STEP_SIZE * Math.sign(instantChange),
                STEP_SIZE,
              )
            : appState.gridStep + instantChange;
        }

        if (!nextGridStep) {
          setInputValue(appState.gridStep);
        } else {
          nextGridStep = getNormalizedGridStep(nextGridStep);
          setInputValue(nextGridStep);
          setAppState({
            gridStep: nextGridStep,
          });
        }
      }}
      scene={scene}
      value={appState.gridStep}
      property={property}
      appState={appState}
    />
  );
};

export default CanvasGrid;
