import { useEffect } from "react";
import { useBackendHealth } from "@app/hooks/useBackendHealth";
import { tauriBackendService } from "@app/services/tauriBackendService";

/**
 * Hook to initialize backend and monitor health
 * @param enabled - Whether to initialize the backend (default: true)
 */
export function useBackendInitializer(enabled = true) {
  const { status, checkHealth } = useBackendHealth();

  useEffect(() => {
    // Skip if disabled
    if (!enabled) {
      return;
    }

    const initializeBackend = async () => {
      try {
        if (tauriBackendService.getBackendPort()) {
          void checkHealth();
          return;
        }
        await tauriBackendService.attachToBundledBackend();
        setTimeout(() => {
          void checkHealth();
        }, 500);
      } catch (error) {
        console.error("[BackendInitializer] Failed to start backend:", error);
      }
    };

    if (tauriBackendService.getBackendPort()) {
      void checkHealth();
      return;
    }

    if (status !== "healthy" && status !== "starting") {
      void initializeBackend();
    }
  }, [enabled, status, checkHealth]);
}
