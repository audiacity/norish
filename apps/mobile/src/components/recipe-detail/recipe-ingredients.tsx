import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { sharedConfigHooks } from "@/hooks/config/shared-config-hooks";
import { useAmountDisplayPreference } from "@/hooks/use-amount-display-preference";
import Entypo from "@expo/vector-icons/Entypo";
import { Button, Separator, useThemeColor } from "heroui-native";
import { FormattedNumber, useIntl } from "react-intl";
import { withUniwind } from "uniwind";

import type { RecipeIngredientsDto } from "@norish/shared/contracts";
import { createUnitFormatter } from "@norish/shared-react/hooks";
import { formatAmount } from "@norish/shared/lib/format-amount";

import { SmartText } from "./text-renderer";

const StyledEntypo = withUniwind(Entypo);

// ---------------------------------------------------------------------------
// Servings control (matches web ServingsControl pattern)
// ---------------------------------------------------------------------------

type ServingsControlProps = {
  servings: number;
  onServingsChange: (s: number) => void;
};

function ServingsControl({ servings, onServingsChange }: ServingsControlProps) {
  const [foregroundColor, mutedColor] = useThemeColor(["foreground", "muted"] as const);

  const dec = useCallback(() => {
    onServingsChange(
      servings <= 1 ? Math.max(0.125, servings / 2) : servings <= 2 ? 1 : servings - 1
    );
  }, [servings, onServingsChange]);

  const inc = useCallback(() => {
    onServingsChange(servings < 1 ? Math.min(1, servings * 2) : servings + 1);
  }, [servings, onServingsChange]);

  return (
    <View style={styles.servingsRow}>
      <Button
        variant="secondary"
        size="sm"
        isIconOnly
        className="bg-surface-tertiary size-7 rounded-lg"
        onPress={dec}
      >
        <StyledEntypo name="minus" size={14} className="text-foreground" />
      </Button>
      <Text style={[styles.servingsValue, { color: foregroundColor }]}>
        <FormattedNumber value={servings} maximumFractionDigits={2} />
      </Text>
      <Button
        variant="secondary"
        size="sm"
        isIconOnly
        className="bg-surface-tertiary size-7 rounded-lg"
        onPress={inc}
      >
        <StyledEntypo name="plus" size={14} className="text-foreground" />
      </Button>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Ingredients list
// ---------------------------------------------------------------------------

type RecipeIngredientsProps = {
  ingredients: RecipeIngredientsDto[];
  baseServings: number;
  /** Controlled servings value (optional — uses internal state if omitted) */
  servings?: number;
  /** Controlled servings change handler */
  onServingsChange?: (s: number) => void;
};

export function RecipeIngredients({
  ingredients,
  baseServings,
  servings: controlledServings,
  onServingsChange: controlledOnServingsChange,
}: RecipeIngredientsProps) {
  const [foregroundColor, accentColor] = useThemeColor(["foreground", "accent"] as const);
  const [internalServings, setInternalServings] = useState(baseServings);
  const { mode, toggleMode } = useAmountDisplayPreference();
  const intl = useIntl();
  const { units } = sharedConfigHooks.useUnitsQuery();
  const { formatUnitOnly } = createUnitFormatter({ locale: intl.locale, units });

  // Support both controlled and uncontrolled modes
  const servings = controlledServings ?? internalServings;
  const setServings = controlledOnServingsChange ?? setInternalServings;

  const scale = servings / baseServings;

  return (
    <View style={styles.container}>
      {/* Header row: title + toggle + servings control */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: foregroundColor }]}>
          {intl.formatMessage({ id: "recipes.detail.ingredients" })}
        </Text>
        <View style={styles.headerControls}>
          <Button
            variant="secondary"
            size="sm"
            isIconOnly
            className="bg-surface-tertiary size-7 rounded-lg"
            onPress={toggleMode}
          >
            <Text className="text-foreground text-xs font-semibold">
              {mode === "fraction" ? "½" : "0.5"}
            </Text>
          </Button>
          <ServingsControl servings={servings} onServingsChange={setServings} />
        </View>
      </View>

      {/* Ingredient rows */}
      {ingredients.map((item, index) => {
        const displayName = item.ingredientName ?? "";

        // ── Heading row (starts with #) ─────────────────────────────────
        const isHeading = displayName.trim().startsWith("#");
        if (isHeading) {
          const headingText = displayName.trim().replace(/^#+\s*/, "");
          return (
            <React.Fragment key={`heading-${index}`}>
              {index > 0 && <View style={styles.headingSpacer} />}
              <Text style={[styles.groupHeading, { color: foregroundColor }]}>{headingText}</Text>
            </React.Fragment>
          );
        }

        // ── Regular ingredient ──────────────────────────────────────────
        const scaledAmount =
          item.amount != null && !isNaN(Number(item.amount))
            ? formatAmount(Number(item.amount) * scale, mode)
            : null;

        return (
          <React.Fragment key={`${item.id ?? displayName}-${index}`}>
            <View style={styles.row}>
              {(scaledAmount || item.unit) && (
                <Text style={[styles.amount, { color: foregroundColor }]}>
                  {scaledAmount}
                  {item.unit ? (
                    <Text style={{ color: accentColor }}>
                      {scaledAmount ? " " : ""}
                      {formatUnitOnly(
                        item.unit,
                        item.amount != null ? Number(item.amount) * scale : null
                      )}
                    </Text>
                  ) : null}
                </Text>
              )}
              <SmartText style={[styles.name, { color: foregroundColor }]} highlightTimers>
                {displayName}
              </SmartText>
            </View>
            {index < ingredients.length - 1 &&
              !(ingredients[index + 1]?.ingredientName ?? "").trim().startsWith("#") && (
                <Separator />
              )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  servingsValue: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  groupHeading: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headingSpacer: {
    height: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    paddingVertical: 12,
  },
  name: {
    fontSize: 16,
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
