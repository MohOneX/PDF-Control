import { useTranslation } from "react-i18next";
import { Icon } from "@app/ui/Icon";
import type { IconName } from "@app/ui/Icon";
import { useToolWorkflow } from "@app/contexts/ToolWorkflowContext";
import type { ToolId } from "@app/types/toolId";

const STARTERS: { id: ToolId; icon: IconName }[] = [
  { id: "merge", icon: "copy-plus" },
  { id: "compress", icon: "shrink" },
  { id: "ocr", icon: "scan-text" },
  { id: "sign", icon: "signature" },
];

/** Quick tool jumps under the landing CTA — only tools present in the registry. */
export function LandingStarterTools() {
  const { t } = useTranslation();
  const { handleToolSelect, toolRegistry } = useToolWorkflow();

  const available = STARTERS.filter(({ id }) => toolRegistry[id]);
  if (available.length === 0) {
    return null;
  }

  return (
    <div className="landing-starters">
      <p className="landing-starters-label">
        {t("landing.startersLabel", "Popular tools")}
      </p>
      <div className="landing-starters-row" role="list">
        {available.map(({ id, icon }) => {
          const tool = toolRegistry[id];
          if (!tool) return null;
          return (
            <button
              key={id}
              type="button"
              role="listitem"
              className="landing-starter"
              onClick={(event) => {
                event.stopPropagation();
                handleToolSelect(id);
              }}
            >
              <span className="landing-starter-icon" aria-hidden>
                <Icon name={icon} size="1.25rem" />
              </span>
              <span className="landing-starter-name">{tool.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
