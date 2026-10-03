import { useEffect, useRef } from "react";
import { Group, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Button } from "@app/ui/Button";
import { Icon } from "@app/ui/Icon";
import type { StirlingFile } from "@app/types/fileContext";
import { useRemovePagesPageGrid } from "@app/hooks/tools/removePages/useRemovePagesPageGrid";
import "@app/components/tools/removePages/RemovePagesPageGrid.css";

interface RemovePagesPageGridProps {
  file: StirlingFile | null;
  pageNumbers: string;
  onPageNumbersChange: (value: string) => void;
  knownPageCount?: number;
  disabled?: boolean;
}

function PageTile({
  pageNumber,
  selected,
  thumbnailUrl,
  disabled,
  onToggle,
  ensureThumbnail,
}: {
  pageNumber: number;
  selected: boolean;
  thumbnailUrl: string | null | undefined;
  disabled: boolean;
  onToggle: () => void;
  ensureThumbnail: (pageNumber: number) => void;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          ensureThumbnail(pageNumber);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ensureThumbnail, pageNumber]);

  return (
    <UnstyledButton
      ref={ref}
      type="button"
      className={
        selected
          ? "remove-pages-tile remove-pages-tile--selected"
          : "remove-pages-tile"
      }
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={t("removePages.grid.pageAria", "Page {{page}}", {
        page: pageNumber,
      })}
    >
      <span className="remove-pages-tile-preview" aria-hidden>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" />
        ) : (
          <span className="remove-pages-tile-skeleton" />
        )}
        {selected ? (
          <span className="remove-pages-tile-badge">
            <Icon name="minus" size="0.85rem" />
          </span>
        ) : null}
      </span>
      <span className="remove-pages-tile-label">{pageNumber}</span>
    </UnstyledButton>
  );
}

/** Thumbnail multi-select: mark pages to remove, then run Remove Pages. */
export function RemovePagesPageGrid({
  file,
  pageNumbers,
  onPageNumbersChange,
  knownPageCount,
  disabled = false,
}: RemovePagesPageGridProps) {
  const { t } = useTranslation();
  const grid = useRemovePagesPageGrid({
    file,
    pageNumbers,
    onPageNumbersChange,
    knownPageCount,
  });

  if (!file) {
    return (
      <Text size="sm" c="dimmed">
        {t(
          "removePages.grid.noFile",
          "Open a PDF to select pages for removal.",
        )}
      </Text>
    );
  }

  if (grid.loadingCount && grid.pageCount === 0) {
    return (
      <Text size="sm" c="dimmed">
        {t("removePages.grid.loading", "Loading pages…")}
      </Text>
    );
  }

  if (grid.pageCount === 0) {
    return (
      <Text size="sm" c="dimmed">
        {t("removePages.grid.empty", "Could not read pages from this PDF.")}
      </Text>
    );
  }

  const pages = Array.from({ length: grid.pageCount }, (_, i) => i + 1);

  return (
    <div className="remove-pages-grid">
      <Group justify="space-between" align="center" gap="xs" wrap="wrap">
        <Text size="sm" fw={500}>
          {t("removePages.grid.selectedCount", "{{count}} selected", {
            count: grid.selectedCount,
          })}
        </Text>
        <Group gap="xs">
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || grid.selectedCount === grid.pageCount}
            onClick={grid.selectAll}
          >
            {t("removePages.grid.selectAll", "Select all")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || grid.selectedCount === 0}
            onClick={grid.clearSelection}
          >
            {t("removePages.grid.clear", "Clear")}
          </Button>
        </Group>
      </Group>

      <Text size="xs" c="dimmed" mt={4}>
        {t(
          "removePages.grid.hint",
          "Click pages to mark them for removal. Selected pages show a minus badge.",
        )}
      </Text>

      <div className="remove-pages-grid-scroll" role="list">
        {pages.map((pageNumber) => (
          <PageTile
            key={pageNumber}
            pageNumber={pageNumber}
            selected={grid.selectedPages.has(pageNumber)}
            thumbnailUrl={grid.thumbnails[pageNumber]}
            disabled={disabled}
            onToggle={() => grid.togglePage(pageNumber)}
            ensureThumbnail={(page) => {
              void grid.ensureThumbnail(page);
            }}
          />
        ))}
      </div>
    </div>
  );
}
