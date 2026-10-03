import { useTranslation } from "react-i18next";
import { TooltipContent } from "@app/types/tips";

export const useRemovePagesTips = (): TooltipContent => {
  const { t } = useTranslation();

  return {
    header: {
      title: t("removePages.tooltip.header.title", "Remove Pages Settings"),
    },
    tips: [
      {
        title: t("removePages.tooltip.pageNumbers.title", "Page Selection"),
        description: t(
          "removePages.tooltip.pageNumbers.text",
          "Click page thumbnails to mark them for removal, then press Remove Pages. Selected pages show a minus badge.",
        ),
        bullets: [
          t(
            "removePages.tooltip.pageNumbers.bullet1",
            "Click a thumbnail to select or deselect that page",
          ),
          t(
            "removePages.tooltip.pageNumbers.bullet2",
            "Use Select all / Clear for bulk changes",
          ),
          t(
            "removePages.tooltip.pageNumbers.bullet3",
            "Advanced: type ranges like 1-5 or expressions like 2n+1",
          ),
          t(
            "removePages.tooltip.pageNumbers.bullet4",
            "Open ranges: 5- removes from page 5 to the end",
          ),
        ],
      },
      {
        title: t("removePages.tooltip.examples.title", "Common Examples"),
        description: t(
          "removePages.tooltip.examples.text",
          "Here are some common page selection patterns:",
        ),
        bullets: [
          t("removePages.tooltip.examples.bullet1", "Remove first page: 1"),
          t("removePages.tooltip.examples.bullet2", "Remove last 3 pages: -3"),
          t(
            "removePages.tooltip.examples.bullet3",
            "Remove every other page: 2n",
          ),
          t(
            "removePages.tooltip.examples.bullet4",
            "Remove specific scattered pages: 1,5,10,15",
          ),
        ],
      },
    ],
  };
};
