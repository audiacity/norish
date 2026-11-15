import React from "react";
import { ShellMenu } from "@/components/shell/menu";
import { Divider, Button as UIButton } from "@expo/ui/swift-ui";
import { useThemeColor } from "heroui-native";
import { useIntl } from "react-intl";

import type { GroceryViewMode } from "./types";

type GroceriesMenuProps = {
  viewMode: GroceryViewMode;
  onViewModeChange: (mode: GroceryViewMode) => void;
};

export function GroceriesMenu({ viewMode, onViewModeChange }: GroceriesMenuProps) {
  const intl = useIntl();
  const [mutedColor] = useThemeColor(["muted"] as const);

  return (
    <ShellMenu
      label={intl.formatMessage({ id: "groceries.page.views" })}
      systemImage="gearshape"
      color={mutedColor}
    >
      <UIButton
        label={intl.formatMessage({ id: "groceries.page.viewByStore" })}
        systemImage={viewMode === "store" ? "checkmark.circle.fill" : "storefront"}
        onPress={() => onViewModeChange("store")}
      />
      <UIButton
        label={intl.formatMessage({ id: "groceries.page.viewByRecipe" })}
        systemImage={viewMode === "recipe" ? "checkmark.circle.fill" : "fork.knife"}
        onPress={() => onViewModeChange("recipe")}
      />
      <Divider />
      <UIButton
        label={intl.formatMessage({ id: "groceries.storeManager.addStore" })}
        systemImage="plus.circle"
        onPress={() => {
          // placeholder — store creation not yet implemented
        }}
      />
    </ShellMenu>
  );
}
