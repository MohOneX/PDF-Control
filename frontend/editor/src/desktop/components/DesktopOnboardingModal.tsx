import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import OnboardingSlideShell, {
  ShellHero,
  type ShellButton,
} from "@app/components/onboarding/OnboardingSlideShell";
import WelcomeSlide from "@app/components/onboarding/slides/WelcomeSlide";
import { useBypassOnboarding } from "@app/components/onboarding/useBypassOnboarding";

/** Bumped whenever the welcome copy changes materially: it means "has seen the current
 *  welcome", not "has launched before". The old key is left behind, not migrated. */
const ONBOARDING_KEY = "stirling-desktop-onboarding-seen.v2";

/** Offline-only desktop onboarding: welcome slide only (no sign-in). */
export function DesktopOnboardingModal() {
  const { t } = useTranslation();
  const bypassOnboarding = useBypassOnboarding();
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY),
  );

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
  };

  const welcomeSlide = useMemo(() => WelcomeSlide(), []);

  if (bypassOnboarding || !visible) return null;

  const buttons: ShellButton[] = [
    {
      key: "welcome-next",
      label: t("onboarding.buttons.getStarted", "Get started"),
      primary: true,
      action: "next",
    },
  ];

  return (
    <OnboardingSlideShell
      opened
      hero={<ShellHero appIcon />}
      slideKey="desktop-welcome"
      title={welcomeSlide.title}
      body={welcomeSlide.body}
      stepIndex={0}
      stepCount={1}
      buttons={buttons}
      onAction={() => finish()}
      allowDismiss={false}
      headerControl="forward"
      onClose={finish}
    />
  );
}
