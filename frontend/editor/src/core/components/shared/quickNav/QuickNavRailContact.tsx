import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@app/ui/Icon";
import { Tooltip } from "@app/components/shared/Tooltip";
import { openExternal } from "@app/platform/openExternal";
import "@app/components/shared/quickNav/QuickNavRailContact.css";

/** International number without +; wa.me rejects spaces and punctuation. */
const DEVELOPER_WHATSAPP_NUMBER = "9647807461533";
const DEVELOPER_WHATSAPP_URL = `https://wa.me/${DEVELOPER_WHATSAPP_NUMBER}`;

/**
 * Contact control above Settings: credit + WhatsApp link to the developer.
 *
 * Plain HTML on purpose — the rail mounts in AppFrame above AppProviders, so
 * Mantine Popover/Button (which need MantineProvider) would crash the tree
 * and leave a black window.
 */
export function QuickNavRailContact() {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const label = t("quickNav.contactDeveloper", "Contact the developer");
  const developedBy = t("brand.developedBy", "Developed By MohOneX");
  const whatsappLabel = t("quickNav.contactWhatsApp", "WhatsApp");

  useEffect(() => {
    if (!opened) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpened(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpened(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [opened]);

  return (
    <div className="quick-nav-rail-contact" ref={rootRef}>
      <Tooltip
        content={label}
        position="right"
        arrow
        containerStyle={{ pointerEvents: "none" }}
      >
        <button
          type="button"
          className="quick-nav-rail-item"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={opened}
          aria-controls={panelId}
          data-testid="contact-developer-button"
          onClick={() => setOpened((value) => !value)}
        >
          <Icon name="contact" size="1.125rem" />
        </button>
      </Tooltip>
      {opened && (
        <div
          id={panelId}
          className="quick-nav-rail-contact-panel"
          role="dialog"
          aria-label={label}
        >
          <p className="quick-nav-rail-contact-credit">{developedBy}</p>
          <button
            type="button"
            className="quick-nav-rail-contact-whatsapp"
            onClick={() => {
              void openExternal(DEVELOPER_WHATSAPP_URL);
              setOpened(false);
            }}
          >
            <Icon name="whatsapp" size="1rem" />
            <span>{whatsappLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}
