import { memo } from "react";
import CoreToolButton from "@core/components/tools/toolPicker/ToolButton";

type CoreToolButtonProps = React.ComponentProps<typeof CoreToolButton>;

/**
 * Desktop override of ToolButton.
 * Offline-only build: no sign-in click path for unavailable tools.
 */
const ToolButton: React.FC<CoreToolButtonProps> = (props) => {
  return <CoreToolButton {...props} />;
};

export default memo(ToolButton);
