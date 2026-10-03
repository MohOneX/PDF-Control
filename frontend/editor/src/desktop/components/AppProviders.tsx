import { ReactNode, useEffect, useState } from "react";
import { AppProviders as ProprietaryAppProviders } from "@proprietary/components/AppProviders";
import { DesktopConfigSync } from "@app/components/DesktopConfigSync";
import { DesktopQueryCacheReset } from "@app/components/DesktopQueryCacheReset";
import { SaveShortcutListener } from "@app/components/SaveShortcutListener";
import { DiskConflictHost } from "@app/components/shared/DiskConflictHost";
import { DesktopOnboardingModal } from "@app/components/DesktopOnboardingModal";
import { ToolActionsContext } from "@app/contexts/ToolActionsContext";
import { useBackendInitializer } from "@app/hooks/useBackendInitializer";
import { DESKTOP_DEFAULT_APP_CONFIG } from "@app/config/defaultAppConfig";
import {
  connectionModeService,
  LOCAL_MODE_STORAGE_KEY,
} from "@app/services/connectionModeService";
import { tauriBackendService } from "@app/services/tauriBackendService";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri } from "@tauri-apps/api/core";
// Core stub — avoids the cloud SaaSTeamProvider that fetches teams/billing on mount.
import { SaaSTeamProvider } from "@core/contexts/SaaSTeamContext";

// Offline fork: prefer local before any async connection-mode read.
if (typeof localStorage !== "undefined") {
  localStorage.setItem(LOCAL_MODE_STORAGE_KEY, "true");
}

/**
 * Offline-only desktop providers.
 * Shows a normal (non-maximized) window quickly, forces local mode, and attaches
 * health monitoring to the backend Rust already starts in the background.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [backendAttached, setBackendAttached] = useState(false);

  // Files dropped outside a dropzone must never navigate the webview to the
  // file (Linux WebKit renders the PDF fullscreen and orphans the app UI).
  useEffect(() => {
    const preventNavigation = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", preventNavigation);
    window.addEventListener("drop", preventNavigation);
    return () => {
      window.removeEventListener("dragover", preventNavigation);
      window.removeEventListener("drop", preventNavigation);
    };
  }, []);

  // Reveal the window centered (Rust also centers; this runs after window-state restore).
  useEffect(() => {
    if (!isTauri()) return;
    const currentWindow = getCurrentWindow();
    void (async () => {
      try {
        await currentWindow.show();
        await currentWindow.unminimize().catch(() => {});
        await currentWindow.center().catch(() => {});
        await currentWindow.setFocus().catch(() => {});
      } catch {
        // Ignore show failures so the React tree still mounts.
      }
    })();
  }, []);

  // Persist local mode, then attach to the bundled backend before tools run.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const mode = await connectionModeService.getCurrentMode();
        if (mode !== "local") {
          await connectionModeService.switchToLocal();
        }
      } catch (error) {
        console.error("[AppProviders] Failed to ensure local mode:", error);
      }

      try {
        // Rust usually already started the process; this discovers the port and
        // begins health checks. Safe if already running.
        await tauriBackendService.attachToBundledBackend();
      } catch (error) {
        console.error("[AppProviders] Failed to attach backend:", error);
      } finally {
        if (!cancelled) setBackendAttached(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useBackendInitializer(backendAttached);

  const providerProps = {
    appConfigRetryOptions: {
      maxRetries: 5,
      initialDelay: 1000,
    },
    appConfigProviderProps: {
      initialConfig: DESKTOP_DEFAULT_APP_CONFIG,
      bootstrapMode: "non-blocking" as const,
      autoFetch: false,
    },
  };

  return (
    <ProprietaryAppProviders {...providerProps}>
      <ToolActionsContext.Provider value={{}}>
        <DesktopQueryCacheReset />
        <SaaSTeamProvider>
          <DesktopConfigSync />
          <SaveShortcutListener />
          <DiskConflictHost />
          {children}
          <DesktopOnboardingModal />
        </SaaSTeamProvider>
      </ToolActionsContext.Provider>
    </ProprietaryAppProviders>
  );
}
