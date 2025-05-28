import { bubbleIcon } from "@excalidraw/excalidraw/components/icons";

import { useDevice } from "../App";

import type { JSX } from "react";

const MenuItemContent = ({
  textStyle,
  icon,
  shortcut,
  children,
  hasNotification = false,
}: {
  icon?: JSX.Element;
  shortcut?: string;
  textStyle?: React.CSSProperties;
  hasNotification?: boolean;
  children: React.ReactNode;
}) => {
  const device = useDevice();
  return (
    <>
      {hasNotification && (
        <div className="dropdown-menu-item__icon">{bubbleIcon}</div>
      )}
      {icon && <div className="dropdown-menu-item__icon">{icon}</div>}
      <div style={textStyle} className="dropdown-menu-item__text">
        {children}
      </div>
      {shortcut && !device.editor.isMobile && (
        <div className="dropdown-menu-item__shortcut">{shortcut}</div>
      )}
    </>
  );
};
export default MenuItemContent;
