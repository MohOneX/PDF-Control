import React, { useState, useEffect } from "react";
import { Stack, Card, Badge, Text, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  connectionModeService,
  ConnectionConfig,
} from "@app/services/connectionModeService";

/** Offline-only desktop: connection settings are informational — no sign-in. */
export const ConnectionSettings: React.FC = () => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ConnectionConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const currentConfig = await connectionModeService.getCurrentConfig();
      setConfig(currentConfig);
    };

    void loadConfig();

    const unsubscribe =
      connectionModeService.subscribeToModeChanges(loadConfig);
    return unsubscribe;
  }, []);

  if (!config) {
    return <Text>{t("common.loading", "Loading...")}</Text>;
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600}>
            {t("settings.connection.title", "Connection Mode")}
          </Text>
          <Badge color="white" variant="light">
            {t("settings.connection.mode.local", "Local Only")}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          {t(
            "settings.connection.localDescription",
            "This app runs fully offline with the local backend. No account or internet connection is required.",
          )}
        </Text>
      </Stack>
    </Card>
  );
};
