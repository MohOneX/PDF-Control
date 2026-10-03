import { useCallback, useMemo } from "react";
import {
  useToolManagement as useCoreToolManagement,
  type ToolAvailabilityMap,
  type ToolDisableCause,
  type ToolAvailabilityInfo,
} from "@core/hooks/useToolManagement";
import { useToolRegistry } from "@app/contexts/ToolRegistryContext";
import {
  isComingSoonTool,
  type ToolRegistry,
  type ToolRegistryEntry,
} from "@app/data/toolsTaxonomy";
import type { ToolId } from "@app/types/toolId";

export type { ToolAvailabilityMap, ToolDisableCause, ToolAvailabilityInfo };

/**
 * Offline desktop: never list tools the local backend cannot run.
 * Ignores the "Hide unavailable tools" preference so greyed-out entries stay gone.
 */
export function useToolManagement() {
  const core = useCoreToolManagement();
  const { allTools } = useToolRegistry();

  const toolRegistry: Partial<ToolRegistry> = useMemo(() => {
    const available: Partial<ToolRegistry> = {};
    for (const toolKey of Object.keys(allTools) as ToolId[]) {
      const baseTool = allTools[toolKey];
      if (!baseTool) continue;

      const availabilityInfo = core.toolAvailability[toolKey];
      const isAvailable = availabilityInfo
        ? availabilityInfo.available !== false
        : true;
      if (!isAvailable || isComingSoonTool(toolKey, baseTool)) continue;

      available[toolKey] = baseTool;
    }
    return available;
  }, [allTools, core.toolAvailability]);

  const getSelectedTool = useCallback(
    (toolKey: ToolId | null): ToolRegistryEntry | null => {
      return toolKey ? (toolRegistry[toolKey] ?? null) : null;
    },
    [toolRegistry],
  );

  return {
    ...core,
    toolRegistry,
    getSelectedTool,
    selectedTool: getSelectedTool(null),
  };
}
