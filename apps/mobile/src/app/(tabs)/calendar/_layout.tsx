import React from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useIntl } from "react-intl";

export default function CalendarLayout() {
  const intl = useIntl();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLargeTitle: true,
        headerTransparent: Platform.OS === "ios",
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: intl.formatMessage({ id: "navbar.nav.calendar" }) }}
      />
    </Stack>
  );
}
