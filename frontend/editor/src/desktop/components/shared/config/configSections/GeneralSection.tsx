import React, { useCallback, useEffect, useState } from "react";
import { Stack, Alert } from "@mantine/core";
import { useTranslation } from "react-i18next";
import PreferencesSection from "@core/components/shared/config/configSections/preferences/PreferencesSection";
import { DefaultAppSettings } from "@app/components/shared/config/configSections/DefaultAppSettings";
import { useDesktopInstall } from "@app/hooks/useDesktopInstall";
import {
  desktopUpdateService,
  type UpdateMode,
  type UpdateModeInfo,
} from "@app/services/desktopUpdateService";

interface GeneralSectionProps {
  /** Forwarded to the core section; the settings modal header already names it. */
  hideTitle?: boolean;
}

/**
 * Offline desktop Preferences page: no admin banner, no software-update section.
 * Still exposes default PDF-association settings for the local app.
 */
const GeneralSection: React.FC<GeneralSectionProps> = () => {
  const { t } = useTranslation();
  const install = useDesktopInstall();
  const [updateModeInfo, setUpdateModeInfo] = useState<UpdateModeInfo>({
    mode: "prompt",
    locked: false,
  });
  const [updateModeError, setUpdateModeError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    desktopUpdateService.getUpdateModeInfo().then((info) => {
      if (!cancelled) setUpdateModeInfo(info);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateModeChange = useCallback(
    async (mode: UpdateMode) => {
      setUpdateModeError(null);
      try {
        await desktopUpdateService.setUpdateMode(mode);
        const fresh = await desktopUpdateService.getUpdateModeInfo();
        setUpdateModeInfo(fresh);
      } catch (err) {
        console.error("[GeneralSection] setUpdateMode failed:", err);
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === "string"
              ? err
              : t(
                  "settings.general.updates.updateBehaviorErrorLocked",
                  "This setting is locked by your administrator.",
                );
        setUpdateModeError(msg);
      }
    },
    [t],
  );

  return (
    <Stack gap="lg">
      {updateModeError && (
        <Alert
          color="red"
          title={t(
            "settings.general.updates.updateBehaviorError",
            "Could not change update behavior",
          )}
          withCloseButton
          onClose={() => setUpdateModeError(null)}
        >
          {updateModeError}
        </Alert>
      )}
      <PreferencesSection
        hideAdminBanner
        hideUpdateSection
        editorDefaultsSlot={<DefaultAppSettings />}
        desktopInstall={{
          state: install.state,
          progress: install.progress,
          errorMessage: install.errorMessage,
          tauriInstallReady: install.tauriInstallReady,
          canInstall: install.canInstall,
          actions: install.actions,
        }}
        desktopUpdateMode={{
          mode: updateModeInfo.mode,
          locked: updateModeInfo.locked,
          onChange: handleUpdateModeChange,
        }}
      />
    </Stack>
  );
};

export default GeneralSection;
