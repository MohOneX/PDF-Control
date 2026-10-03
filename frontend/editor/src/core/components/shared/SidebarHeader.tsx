import { Logo } from "@app/ui/Logo";
import { EnArLanguageToggle } from "@app/components/shared/EnArLanguageToggle";

export interface SidebarHeaderProps {
  className?: string;
}

/** The wordmark; the brand mark sits in the rail beside it. */
export function SidebarHeader({ className }: SidebarHeaderProps) {
  return (
    <>
      <div className={`file-sidebar-header${className ? ` ${className}` : ""}`}>
        <Logo variant="textOnly" textHeight="1.3rem" />
      </div>
      <div className="file-sidebar-lang-strip">
        <EnArLanguageToggle />
      </div>
    </>
  );
}
