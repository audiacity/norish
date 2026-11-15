import React from "react";
import { Text, View } from "react-native";
import { usePermissionsContext } from "@/context/permissions-context";
import { useTRPC } from "@/providers/trpc-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, Toast, useThemeColor, useToast } from "heroui-native";
import { useIntl } from "react-intl";

import { MEASUREMENT_SYSTEM_CHOICES } from "@norish/shared/contracts/zod/user";
import {
  getMeasurementSystemPreference,
  measurementSystemTarget,
} from "@norish/shared/lib/user-preferences";

type Choice = (typeof MEASUREMENT_SYSTEM_CHOICES)[number];

/** Mirrors web Settings → User → Preferences → Measurements. */
export function ProfileMeasurementPicker() {
  const intl = useIntl();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAIEnabled } = usePermissionsContext();
  const [foregroundColor, mutedColor] = useThemeColor(["foreground", "muted"] as const);
  const { data } = useQuery({ ...trpc.user.get.queryOptions(), staleTime: 60_000 });
  const mutation = useMutation(trpc.user.updatePreferences.mutationOptions());

  // AI variants are offered only where AI is on; a stored one reads as its plain system.
  const choices = isAIEnabled
    ? MEASUREMENT_SYSTEM_CHOICES
    : MEASUREMENT_SYSTEM_CHOICES.filter((choice) => !choice.endsWith("WithAI"));
  const stored = getMeasurementSystemPreference(data?.user);
  const current: Choice = isAIEnabled ? stored : (measurementSystemTarget(stored)?.system ?? "off");
  const label = (choice: Choice) =>
    intl.formatMessage({ id: `settings.user.preferences.measurements.options.${choice}` });

  const handleChange = (choice: Choice) => {
    if (choice === current) return;

    mutation.mutate(
      { version: data?.user.version ?? 1, preferences: { measurementSystem: choice } },
      {
        onError: (error) =>
          toast.show({
            component: (props) => (
              <Toast variant="danger" {...props}>
                <Toast.Title className="text-foreground">
                  {intl.formatMessage({ id: "common.errors.operationFailed" })}
                </Toast.Title>
                <Toast.Description className="text-muted">{error.message}</Toast.Description>
              </Toast>
            ),
          }),
        onSettled: () => queryClient.invalidateQueries({ queryKey: trpc.user.get.queryKey() }),
      }
    );
  };

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: foregroundColor, fontSize: 15, fontWeight: "600" }}>
        {intl.formatMessage({ id: "settings.user.preferences.measurements.title" })}
      </Text>
      <Text style={{ color: mutedColor, fontSize: 12 }}>
        {intl.formatMessage({ id: "settings.user.preferences.measurements.description" })}
      </Text>
      <Select
        presentation="bottom-sheet"
        isDisabled={mutation.isPending}
        value={{ value: current, label: label(current) }}
        onValueChange={(option) => {
          const picked = choices.find(
            (c) => c === (option as { value: string } | undefined)?.value
          );

          if (picked) handleChange(picked);
        }}
      >
        <Select.Trigger>
          <Select.Value placeholder={label(current)} />
          <Select.TriggerIndicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay />
          <Select.Content presentation="bottom-sheet" snapPoints={["45%"]}>
            {choices.map((choice) => (
              <Select.Item key={choice} value={choice} label={label(choice)}>
                <Select.ItemLabel />
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
    </View>
  );
}
