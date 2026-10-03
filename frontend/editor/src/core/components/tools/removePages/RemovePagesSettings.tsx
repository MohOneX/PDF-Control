import { Stack, TextInput, Collapse, UnstyledButton, Text } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@app/ui/Icon";
import { RemovePagesParameters } from "@app/hooks/tools/removePages/useRemovePagesParameters";
import { validatePageNumbers } from "@app/utils/pageSelection";
import { RemovePagesPageGrid } from "@app/components/tools/removePages/RemovePagesPageGrid";
import PageSelectionSyntaxHint from "@app/components/shared/PageSelectionSyntaxHint";
import type { StirlingFile } from "@app/types/fileContext";

interface RemovePagesSettingsProps {
  parameters: RemovePagesParameters;
  onParameterChange: <K extends keyof RemovePagesParameters>(
    key: K,
    value: RemovePagesParameters[K],
  ) => void;
  file?: StirlingFile | null;
  knownPageCount?: number;
  disabled?: boolean;
}

const RemovePagesSettings = ({
  parameters,
  onParameterChange,
  file = null,
  knownPageCount,
  disabled = false,
}: RemovePagesSettingsProps) => {
  const { t } = useTranslation();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const isValid = validatePageNumbers(parameters.pageNumbers || "");
  const hasValue = (parameters?.pageNumbers?.trim().length ?? 0) > 0;

  return (
    <Stack gap="md">
      <RemovePagesPageGrid
        file={file}
        pageNumbers={parameters.pageNumbers || ""}
        onPageNumbersChange={(value) =>
          onParameterChange("pageNumbers", value)
        }
        knownPageCount={knownPageCount}
        disabled={disabled}
      />

      <div>
        <UnstyledButton
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          disabled={disabled}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <Icon
            name={advancedOpen ? "chevron-down" : "chevron-right"}
            size="0.9rem"
          />
          <Text size="sm" fw={500}>
            {t("removePages.advancedToggle", "Advanced page numbers")}
          </Text>
        </UnstyledButton>

        <Collapse in={advancedOpen}>
          <Stack gap="xs" mt="sm">
            <TextInput
              label={t("removePages.pageNumbers.label", "Pages to Remove")}
              value={parameters.pageNumbers || ""}
              onChange={(event) =>
                onParameterChange("pageNumbers", event.currentTarget.value)
              }
              placeholder={t(
                "removePages.pageNumbers.placeholder",
                "e.g., 1,3,5-8,10",
              )}
              disabled={disabled}
              error={
                hasValue && !isValid
                  ? t(
                      "removePages.pageNumbers.error",
                      "Invalid page number format. Use numbers, ranges (1-5), or mathematical expressions (2n+1)",
                    )
                  : undefined
              }
            />
            <PageSelectionSyntaxHint
              input={parameters.pageNumbers || ""}
              variant="compact"
            />
          </Stack>
        </Collapse>
      </div>
    </Stack>
  );
};

export default RemovePagesSettings;
