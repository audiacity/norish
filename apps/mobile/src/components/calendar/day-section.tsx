import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, useThemeColor } from "heroui-native";
import { useIntl } from "react-intl";

import type { PlannedItemFromQuery } from "@norish/shared/contracts";

export function DaySection({ date, items }: { date: string; items: PlannedItemFromQuery[] }) {
  const intl = useIntl();
  const router = useRouter();
  const [textColor, mutedColor] = useThemeColor(["foreground", "muted"]);
  // Parse as local noon so the label never shifts across timezones.
  const label = intl.formatDate(new Date(`${date}T12:00:00`), {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: textColor, fontWeight: "700", fontSize: 16 }}>{label}</Text>
      {items.length === 0 ? (
        <Text style={{ color: mutedColor }}>{intl.formatMessage({ id: "calendar.timeline.noItems" })}</Text>
      ) : (
        items.map((item) => {
          const title =
            item.recipeName ?? item.title ?? intl.formatMessage({ id: "calendar.timeline.untitled" });
          const recipeId = item.recipeId;

          return (
            <Pressable
              key={item.id}
              disabled={!recipeId}
              accessibilityRole={recipeId ? "link" : undefined}
              onPress={() => router.push(`/(tabs)/dashboard/recipe/${recipeId}` as never)}
            >
              <Card variant="secondary">
                <Card.Body style={{ padding: 12 }}>
                  <Text style={{ color: mutedColor, fontSize: 12 }}>
                    {intl.formatMessage({ id: `common.slots.${item.slot}` })}
                  </Text>
                  <Text style={{ color: textColor, fontWeight: "600" }}>{title}</Text>
                </Card.Body>
              </Card>
            </Pressable>
          );
        })
      )}
    </View>
  );
}
