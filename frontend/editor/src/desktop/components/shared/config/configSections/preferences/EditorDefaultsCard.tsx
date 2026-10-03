import { useEffect, useId } from "react";
import { InfoTooltip } from "@app/ui/InfoTooltip";
import { Paper, Select, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { SegmentedControl } from "@app/ui/SegmentedControl";
import { usePreferences } from "@app/contexts/PreferencesContext";
import type { ToolPanelMode } from "@app/constants/toolPanel";
import {
  type StartupView,
  type ViewerZoomSetting,
} from "@app/services/preferencesService";
import { Z_INDEX_OVER_CONFIG_MODAL } from "@app/styles/zIndex";

/** Offline desktop: Tools / Reader only; unavailable tools/conversions stay removed. */
export function EditorDefaultsCard() {
  const { t } = useTranslation();
  const labelIds = useId();
  const viewerZoomLabelId = `${labelIds}-viewer-zoom`;
  const { preferences, updatePreference } = usePreferences();

  useEffect(() => {
    if (preferences.defaultStartupView === "automate") {
      updatePreference("defaultStartupView", "tools");
    }
    if (!preferences.hideUnavailableTools) {
      updatePreference("hideUnavailableTools", true);
    }
    if (!preferences.hideUnavailableConversions) {
      updatePreference("hideUnavailableConversions", true);
    }
  }, [
    preferences.defaultStartupView,
    preferences.hideUnavailableTools,
    preferences.hideUnavailableConversions,
    updatePreference,
  ]);

  const startupView: StartupView =
    preferences.defaultStartupView === "automate"
      ? "tools"
      : preferences.defaultStartupView;

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <div
          id="setting-tool-picker-mode"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text fw={500} size="sm">
              {t(
                "settings.general.defaultToolPickerMode",
                "Default tool picker mode",
              )}{" "}
              <InfoTooltip
                label={t(
                  "settings.general.defaultToolPickerModeDescription",
                  "Choose whether the tool picker opens in fullscreen or sidebar by default",
                )}
              />
            </Text>
          </div>
          <SegmentedControl
            value={preferences.defaultToolPanelMode}
            onChange={(val: string) =>
              updatePreference("defaultToolPanelMode", val as ToolPanelMode)
            }
            options={[
              {
                label: t("settings.general.mode.sidebar", "Sidebar"),
                value: "sidebar",
              },
              {
                label: t("settings.general.mode.fullscreen", "Fullscreen"),
                value: "fullscreen",
              },
            ]}
          />
        </div>
        <div
          id="setting-startup-view"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text fw={500} size="sm">
              {t(
                "settings.general.defaultStartupView",
                "Default view on launch",
              )}{" "}
              <InfoTooltip
                label={t(
                  "settings.general.defaultStartupViewDescription",
                  "Choose which view is active when the app starts",
                )}
              />
            </Text>
          </div>
          <SegmentedControl
            value={startupView}
            onChange={(val: string) =>
              updatePreference("defaultStartupView", val as StartupView)
            }
            options={[
              {
                label: t("settings.general.startupView.tools", "Tools"),
                value: "tools",
              },
              {
                label: t("settings.general.startupView.read", "Reader"),
                value: "read",
              },
            ]}
          />
        </div>
        <div
          id="setting-reader-zoom"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text id={viewerZoomLabelId} fw={500} size="sm">
              {t("settings.general.defaultViewerZoom", "Default reader zoom")}{" "}
              <InfoTooltip
                label={t(
                  "settings.general.defaultViewerZoomDescription",
                  "Set the default zoom level when opening PDFs in the reader",
                )}
              />
            </Text>
          </div>
          <Select
            aria-labelledby={viewerZoomLabelId}
            value={preferences.defaultViewerZoom}
            onChange={(val: string | null) => {
              if (val)
                updatePreference("defaultViewerZoom", val as ViewerZoomSetting);
            }}
            data={[
              {
                label: t("settings.general.zoomLevel.auto", "Auto"),
                value: "auto",
              },
              {
                label: t("settings.general.zoomLevel.fitWidth", "Fit width"),
                value: "fitWidth",
              },
              {
                label: t("settings.general.zoomLevel.fitPage", "Fit page"),
                value: "fitPage",
              },
              { label: "50%", value: "50" },
              { label: "75%", value: "75" },
              { label: "100%", value: "100" },
              { label: "125%", value: "125" },
              { label: "150%", value: "150" },
              { label: "200%", value: "200" },
            ]}
            style={{ width: 140 }}
            allowDeselect={false}
            comboboxProps={{
              withinPortal: true,
              zIndex: Z_INDEX_OVER_CONFIG_MODAL,
            }}
          />
        </div>
      </Stack>
    </Paper>
  );
}
