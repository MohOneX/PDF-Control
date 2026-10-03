import { useMemo } from "react";
import {
  useTranslatedToolCatalog as useCoreTranslatedToolCatalog,
  type TranslatedToolCatalog,
} from "@core/data/useTranslatedToolRegistry";
import {
  LinkToolRegistry,
  RegularToolRegistry,
  SuperToolRegistry,
  ToolRegistry,
} from "@app/data/toolsTaxonomy";
import { isLinkToolId, isSuperToolId } from "@app/types/toolId";
import type { ToolId } from "@app/types/toolId";

/**
 * Tools that need PDF Control Cloud, a remote server, or an account.
 * Hidden in the offline-only desktop build.
 */
const CLOUD_ONLY_TOOL_IDS = new Set<string>([
  "sharedSign",
  "automate",
  "classify",
  "devFolderScanning",
  "devSsoGuide",
  "devApi",
  "devAirgapped",
]);

/** Desktop catalog: core tools minus cloud-only entries. */
export function useTranslatedToolCatalog(): TranslatedToolCatalog {
  const core = useCoreTranslatedToolCatalog();

  return useMemo(() => {
    const allTools: ToolRegistry = { ...core.allTools };
    for (const id of CLOUD_ONLY_TOOL_IDS) {
      delete allTools[id as ToolId];
    }

    const regularTools = {} as RegularToolRegistry;
    const superTools = {} as SuperToolRegistry;
    const linkTools = {} as LinkToolRegistry;

    Object.entries(allTools).forEach(([key, entry]) => {
      const toolId = key as ToolId;
      if (isSuperToolId(toolId)) {
        superTools[toolId] = entry;
      } else if (isLinkToolId(toolId)) {
        linkTools[toolId] = entry;
      } else {
        regularTools[toolId] = entry;
      }
    });

    return { allTools, regularTools, superTools, linkTools };
  }, [core]);
}

export type { TranslatedToolCatalog };
