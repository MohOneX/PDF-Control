import { AppConfig } from "@app/contexts/AppConfigContext";

/**
 * Default configuration used while the bundled backend starts up.
 */
export const DESKTOP_DEFAULT_APP_CONFIG: AppConfig = {
  enableLogin: false,
  premiumEnabled: false,
  runningProOrHigher: false,
  // Offline desktop: do not surface tools/conversions the local backend cannot run.
  defaultHideUnavailableTools: true,
  defaultHideUnavailableConversions: true,
};
