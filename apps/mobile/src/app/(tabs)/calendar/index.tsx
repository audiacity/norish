import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DaySection } from "@/components/calendar/day-section";
import { getWeekDays } from "@/components/calendar/week-range";
import { useCalendarQuery, useCalendarSubscription } from "@/hooks/calendar";
import { useThemeColor } from "heroui-native";
import { useIntl } from "react-intl";

export default function CalendarScreen() {
  const intl = useIntl();
  const [offset, setOffset] = useState(0);
  const [textColor] = useThemeColor(["foreground"]);
  const days = useMemo(() => getWeekDays(new Date(), offset), [offset]);
  const { calendarData } = useCalendarQuery(days[0]!, days[6]!);

  useCalendarSubscription(days[0]!, days[6]!);

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 20 }}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustsScrollIndicatorInsets
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Pressable accessibilityRole="button" onPress={() => setOffset((o) => o - 1)}>
          <Text style={{ color: textColor }}>{intl.formatMessage({ id: "calendar.navigation.prev" })}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setOffset(0)}>
          <Text style={{ color: textColor, fontWeight: "600" }}>
            {intl.formatMessage({ id: "calendar.mobile.today" })}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setOffset((o) => o + 1)}>
          <Text style={{ color: textColor }}>{intl.formatMessage({ id: "calendar.navigation.next" })}</Text>
        </Pressable>
      </View>
      {days.map((date) => (
        <DaySection key={date} date={date} items={calendarData[date] ?? []} />
      ))}
    </ScrollView>
  );
}
