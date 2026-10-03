import { useTranslation } from "react-i18next";
import { SegmentedControl } from "@app/ui/SegmentedControl";
import { Icon } from "@app/ui/Icon";
import { setUserLanguage } from "@app/i18n";
import styles from "@app/components/shared/EnArLanguageToggle.module.css";

const EN = "en-US";
const AR = "ar-AR";

type ToggleValue = "en" | "ar";

function languageToToggle(language: string | undefined): ToggleValue {
  if (!language) return "en";
  return language === AR || language.startsWith("ar") ? "ar" : "en";
}

function isLanguageAllowed(
  code: string,
  supportedLngs: readonly string[] | undefined,
): boolean {
  const allowed = (supportedLngs ?? []).filter((lang) => lang !== "cimode");
  return allowed.length === 0 || allowed.includes(code);
}

/**
 * EN ↔ AR switch under the sidebar wordmark. Reloads after change so RTL layout
 * re-evaluates the same way as LanguageSelector.
 */
export function EnArLanguageToggle() {
  const { t, i18n, ready } = useTranslation();

  if (!ready || !i18n.language) {
    return null;
  }

  const supportedLngs = i18n.options.supportedLngs as string[] | undefined;
  if (
    !isLanguageAllowed(EN, supportedLngs) ||
    !isLanguageAllowed(AR, supportedLngs)
  ) {
    return null;
  }

  const value = languageToToggle(i18n.language);

  const handleChange = (next: ToggleValue) => {
    if (languageToToggle(i18n.language) === next) {
      return;
    }
    setUserLanguage(next === "ar" ? AR : EN);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className={styles.root} data-testid="en-ar-language-toggle">
      <Icon name="globe" size="1.125rem" className={styles.icon} />
      <SegmentedControl
        className={styles.control}
        size="sm"
        accent="default"
        variant="primary"
        fullWidth
        value={value}
        onChange={handleChange}
        ariaLabel={t(
          "settings.general.enArToggle",
          "Switch between English and Arabic",
        )}
        options={[
          { label: "EN", value: "en" },
          { label: "عربي", value: "ar" },
        ]}
      />
    </div>
  );
}
