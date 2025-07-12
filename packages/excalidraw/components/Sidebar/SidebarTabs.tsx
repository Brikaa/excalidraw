import * as RadixTabs from "@radix-ui/react-tabs";

import { useUIAppState } from "../../context/ui-appState";
import { useExcalidrawAppState, useExcalidrawSetAppState } from "../App";

export const SidebarTabs = ({
  children,
  ...rest
}: {
  children: React.ReactNode;
} & Omit<React.RefAttributes<HTMLDivElement>, "onSelect">) => {
  const uiAppState = useUIAppState();
  const appState = useExcalidrawAppState();
  const setAppState = useExcalidrawSetAppState();

  if (!uiAppState.openSidebar) {
    return null;
  }

  const { name } = uiAppState.openSidebar;

  return (
    <RadixTabs.Root
      className="sidebar-tabs-root"
      value={uiAppState.openSidebar.tab}
      onValueChange={(tab) =>
        setAppState({
          openSidebar: { ...appState.openSidebar, name, tab },
        })
      }
      {...rest}
    >
      {children}
    </RadixTabs.Root>
  );
};
SidebarTabs.displayName = "SidebarTabs";
