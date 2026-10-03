import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseSelection } from "@app/utils/bulkselection/parseSelection";
import { formatPageNumbers } from "@app/utils/formatPageNumbers";
import { pdfWorkerManager } from "@app/services/pdfWorkerManager";
import { getDocumentBytes } from "@app/services/documentBytesCache";
import { useThumbnailGeneration } from "@app/hooks/useThumbnailGeneration";
import type { StirlingFile } from "@app/types/fileContext";

function thumbnailPageId(fileId: string, pageNumber: number): string {
  return `${fileId}:remove-pages:${pageNumber}`;
}

/**
 * Selection state for Remove Pages: clickable thumbnails sync to the
 * `pageNumbers` parameter string the API already expects.
 */
export function useRemovePagesPageGrid(options: {
  file: StirlingFile | null;
  pageNumbers: string;
  onPageNumbersChange: (value: string) => void;
  knownPageCount?: number;
}) {
  const { file, pageNumbers, onPageNumbersChange, knownPageCount } = options;
  const { requestThumbnail } = useThumbnailGeneration();

  const [pageCount, setPageCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<number, string | null>>(
    {},
  );
  const requestedPagesRef = useRef(new Set<number>());
  const fileId = file?.fileId ?? null;

  useEffect(() => {
    if (!file) {
      setPageCount(0);
      return;
    }

    if (knownPageCount && knownPageCount > 0) {
      setPageCount(knownPageCount);
      return;
    }

    let cancelled = false;
    setLoadingCount(true);

    void (async () => {
      try {
        const bytes = await getDocumentBytes(file);
        const pdf = await pdfWorkerManager.createDocument(bytes, {
          disableAutoFetch: true,
          disableStream: true,
        });
        try {
          if (!cancelled) setPageCount(pdf.numPages);
        } finally {
          pdfWorkerManager.destroyDocument(pdf);
        }
      } catch (error) {
        console.error("[RemovePages] Failed to read page count:", error);
        if (!cancelled) setPageCount(0);
      } finally {
        if (!cancelled) setLoadingCount(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file, knownPageCount]);

  useEffect(() => {
    setThumbnails({});
    requestedPagesRef.current = new Set();
  }, [fileId]);

  const selectedPages = useMemo(() => {
    if (pageCount <= 0) return new Set<number>();
    return new Set(parseSelection(pageNumbers || "", pageCount));
  }, [pageNumbers, pageCount]);

  const emitSelection = useCallback(
    (pages: Iterable<number>) => {
      onPageNumbersChange(formatPageNumbers([...pages]));
    },
    [onPageNumbersChange],
  );

  const togglePage = useCallback(
    (pageNumber: number) => {
      const next = new Set(selectedPages);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      emitSelection(next);
    },
    [selectedPages, emitSelection],
  );

  const selectAll = useCallback(() => {
    if (pageCount <= 0) return;
    emitSelection(Array.from({ length: pageCount }, (_, i) => i + 1));
  }, [pageCount, emitSelection]);

  const clearSelection = useCallback(() => {
    emitSelection([]);
  }, [emitSelection]);

  const ensureThumbnail = useCallback(
    async (pageNumber: number) => {
      if (!file || !fileId) return;
      if (requestedPagesRef.current.has(pageNumber)) return;
      requestedPagesRef.current.add(pageNumber);

      try {
        const url = await requestThumbnail(
          thumbnailPageId(fileId, pageNumber),
          file,
          pageNumber,
        );
        setThumbnails((prev) => ({ ...prev, [pageNumber]: url }));
      } catch {
        setThumbnails((prev) => ({ ...prev, [pageNumber]: null }));
      }
    },
    [file, fileId, requestThumbnail],
  );

  return {
    pageCount,
    loadingCount,
    selectedPages,
    selectedCount: selectedPages.size,
    thumbnails,
    togglePage,
    selectAll,
    clearSelection,
    ensureThumbnail,
  };
}
