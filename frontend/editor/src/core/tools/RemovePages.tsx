import { useTranslation } from "react-i18next";
import { createToolFlow } from "@app/components/tools/shared/createToolFlow";
import { BaseToolProps, ToolComponent } from "@app/types/tool";
import { useBaseTool } from "@app/hooks/tools/shared/useBaseTool";
import { useRemovePagesParameters } from "@app/hooks/tools/removePages/useRemovePagesParameters";
import { useRemovePagesOperation } from "@app/hooks/tools/removePages/useRemovePagesOperation";
import RemovePagesSettings from "@app/components/tools/removePages/RemovePagesSettings";
import { useRemovePagesTips } from "@app/components/tooltips/useRemovePagesTips";
import { useViewScopedFileStubs } from "@app/hooks/tools/shared/useViewScopedFiles";

const RemovePages = (props: BaseToolProps) => {
  const { t } = useTranslation();
  const tooltipContent = useRemovePagesTips();
  const stubs = useViewScopedFileStubs();

  const base = useBaseTool(
    "remove-pages",
    useRemovePagesParameters,
    useRemovePagesOperation,
    props,
  );

  const primaryFile = base.selectedFiles[0] ?? null;
  const knownPageCount = stubs[0]?.processedFile?.totalPages;

  const settingsContent = (
    <RemovePagesSettings
      parameters={base.params.parameters}
      onParameterChange={base.params.updateParameter}
      file={primaryFile}
      knownPageCount={knownPageCount}
      disabled={base.endpointLoading}
    />
  );

  return createToolFlow({
    files: {
      selectedFiles: base.selectedFiles,
      isCollapsed: base.hasResults,
    },
    steps: [
      {
        title: t("removePages.settings.title", "Settings"),
        isCollapsed: base.settingsCollapsed,
        onCollapsedClick: base.settingsCollapsed
          ? base.handleSettingsReset
          : undefined,
        content: settingsContent,
        tooltip: tooltipContent,
      },
    ],
    executeButton: {
      text: t("removePages.submit", "Remove Pages"),
      loadingText: t("loading"),
      onClick: base.handleExecute,
      isVisible: !base.hasResults,
      endpointEnabled: base.endpointEnabled,
      paramsValid: base.params.validateParameters(),
    },
    review: {
      isVisible: base.hasResults,
      operation: base.operation,
      title: t("removePages.results.title", "Pages Removed"),
      onFileClick: base.handleThumbnailClick,
      onUndo: base.handleUndo,
    },
  });
};

RemovePages.tool = () => useRemovePagesOperation;

export default RemovePages as ToolComponent;
