import type { ReactNode } from "react";
import type { ProcessingFolderCreation } from "@core/hooks/useProcessingFolderCreation";

export type { ProcessingFolderCreation };

/** Offline desktop: no processing-folder / Automate workflows. */
export const canCreateProcessingFolders = false;

export function useProcessingFolderCreation(): ProcessingFolderCreation {
  return { dialog: null };
}
