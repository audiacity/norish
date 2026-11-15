import { useEffect, useRef } from "react";
import { usePermissionsContext } from "@/context/permissions-context";
import { useRecipeContext } from "@/context/recipe-detail-context";
import { useTRPC } from "@/providers/trpc-provider";
import { useQuery } from "@tanstack/react-query";

import {
  getMeasurementSystemPreference,
  measurementSystemTarget,
} from "@norish/shared/lib/user-preferences";

/**
 * Mirrors web's useAutoConversion: opens a recipe in the measurement system
 * from the user's server-side preference (off by default), once per recipe.
 */
export function useAutoConversion() {
  const trpc = useTRPC();
  const { recipe, isFetching, convertingTo, startConversion } = useRecipeContext() ?? {};
  const { data } = useQuery({ ...trpc.user.get.queryOptions(), staleTime: 60_000 });
  const { canEditRecipe, isAIEnabled, isLoading } = usePermissionsContext();
  const choice = getMeasurementSystemPreference(data?.user);
  const doneForRef = useRef<string | null>(null);

  useEffect(() => {
    const target = measurementSystemTarget(choice);

    if (!recipe || !startConversion || !target || isLoading || isFetching || convertingTo) return;
    if (doneForRef.current === recipe.id) return;
    if (recipe.recipeIngredients.length === 0) return;
    if (recipe.userId && !canEditRecipe(recipe.userId)) return;

    doneForRef.current = recipe.id;
    if (recipe.systemUsed === target.system) return;

    const hasCopy = recipe.recipeIngredients.some((l) => l.systemUsed === target.system);

    startConversion(target.system, target.withAI && isAIEnabled && !hasCopy);
  }, [
    recipe,
    choice,
    isLoading,
    isFetching,
    convertingTo,
    canEditRecipe,
    isAIEnabled,
    startConversion,
  ]);
}
