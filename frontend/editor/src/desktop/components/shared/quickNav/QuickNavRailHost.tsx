import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { QuickNavRailContainer } from "@app/components/shared/quickNav/QuickNavRailContainer";
import type { QuickNavEntry } from "@app/components/shared/quickNav/QuickNavRailBase";
import { useQuickNavHost } from "@app/contexts/QuickNavHostContext";
import { requestReaderMode } from "@app/utils/pendingReaderMode";
import {
  saveEditorReturnPath,
  takeEditorReturnPath,
} from "@app/services/workbenchSession";
import { EDITOR_BASENAME } from "@app/routes/editorBasename";
import { PORTAL_BASENAME } from "@app/routes/portalBasename";
import { HAS_PORTAL } from "@app/routes/hasPortal";
import { stripBasePath } from "@app/constants/app";
import { rememberSettingsOrigin } from "@app/utils/settingsNavigation";
import { requestProcessorSignup } from "@app/services/processorSignup";
import { Icon } from "@app/ui/Icon";

const SIZE = "1.125rem";

/**
 * Offline desktop rail: no Automate, Shared Signing, processing folders, or Documentation.
 */
export function QuickNavRailHost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const host = useQuickNavHost();

  const appMounted = Boolean(host?.appMounted);

  const path = stripBasePath(pathname);
  const inSettings = path.startsWith("/settings");
  const inPortal = path.startsWith(PORTAL_BASENAME);
  const inEditor = !inPortal && !inSettings;

  const returnHome = () => {
    const reset = host?.actions.current?.goToDefaultState;
    if (reset) reset();
    else navigate(inPortal ? PORTAL_BASENAME : EDITOR_BASENAME);
  };

  const guarded = (leave: () => void) => {
    const guard = host?.actions.current?.requestNavigation;
    if (guard) guard(leave);
    else leave();
  };

  const go = (to: string) => guarded(() => navigate(to));

  const reader: QuickNavEntry = {
    id: "reader",
    label: t("quickNav.reader", "Reader"),
    icon: <Icon name="book-open" size={SIZE} />,
    current: inEditor && Boolean(host?.readerMode),
    onClick: () => {
      const setMode = host?.actions.current?.setReaderMode;
      if (setMode) {
        setMode(!host?.readerMode);
        return;
      }
      requestReaderMode();
      go(EDITOR_BASENAME);
    },
  };

  const editor: QuickNavEntry = {
    id: "editor",
    label: t("quickNav.editor", "Editor"),
    icon: <Icon name="pencil" size={SIZE} filled={inEditor} />,
    current: inEditor && !host?.fileLibrary && !host?.readerMode,
    onClick: () => {
      if (inEditor) {
        returnHome();
        return;
      }
      navigate(takeEditorReturnPath() ?? EDITOR_BASENAME);
    },
  };

  const processor: QuickNavEntry = {
    id: "processor",
    label: t("quickNav.processor", "Processor"),
    icon: <Icon name="cpu" size={SIZE} filled={inPortal} />,
    current: inPortal,
    disabled:
      HAS_PORTAL && !inPortal && !host?.portalAccess && !host?.isAnonymous,
    reason:
      HAS_PORTAL && !inPortal && !host?.portalAccess && !host?.isAnonymous
        ? t("quickNav.noProcessorAccess", "Ask an admin for processor access")
        : undefined,
    onClick: () => {
      if (host?.isAnonymous) {
        requestProcessorSignup();
        return;
      }
      if (inPortal) {
        returnHome();
        return;
      }
      if (inEditor) saveEditorReturnPath();
      go(PORTAL_BASENAME);
    },
  };

  const surfaces: QuickNavEntry[] = [
    reader,
    editor,
    ...(HAS_PORTAL ? [processor] : []),
  ];

  const within: QuickNavEntry[] = [
    ...(!host?.hasOpenFromComputer
      ? []
      : [
          {
            id: "openFromComputer",
            label: t("fileSidebar.openFromComputer", "Open from computer"),
            icon: <Icon name="file-up" size={SIZE} />,
            testId: "files-button",
            tourId: "files-button",
            onClick: () => host?.actions.current?.openFromComputer?.(),
          },
        ]),
    {
      id: "files",
      label: t("fileSidebar.myFiles", "File library"),
      icon: <Icon name="folder" size={SIZE} />,
      current: Boolean(host?.fileLibrary),
      testId: "my-files-button",
      onClick: () => {
        const show = host?.actions.current?.showFileLibrary;
        if (show) show();
        else go("/files");
      },
    },
  ];

  const openAccount = () => {
    const target = "/settings/general";
    if (inSettings) {
      navigate(target, { replace: true });
      return;
    }
    rememberSettingsOrigin();
    go(target);
  };

  if (!appMounted || host?.chromeless) return null;

  return (
    <QuickNavRailContainer
      groups={[surfaces, within]}
      onReturnHome={returnHome}
      onOpenAccount={openAccount}
      accountActive={inSettings}
      // Offline build: no in-app documentation.
      onOpenDocs={undefined}
      docsActive={false}
      onInvite={undefined}
      onToggleNotifications={() =>
        host?.actions.current?.toggleNotifications?.()
      }
      notificationsOpen={host?.notificationsOpen}
    />
  );
}
