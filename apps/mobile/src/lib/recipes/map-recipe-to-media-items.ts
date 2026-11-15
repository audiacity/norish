/**
 * Maps FullRecipeDTO media (images + videos) into the MediaItem[]
 * array consumed by RecipeMediaHeader.
 */

import type { FullRecipeDTO } from "@norish/shared/contracts";

import { resolveImageUri } from "./resolve-image-url";

// Re-export the MediaItem types for components that need them
export type MediaItemImage = {
  type: "image";
  uri: string;
};

export type MediaItemVideo = {
  type: "video";
  uri: string;
  posterUri?: string;
};

export type MediaItem = MediaItemImage | MediaItemVideo;

/**
 * Build an ordered MediaItem[] from a FullRecipeDTO.
 *
 * Order: videos first, then gallery images, each sorted by order.
 */
export function mapRecipeToMediaItems(
  recipe: FullRecipeDTO,
  backendBaseUrl: string | null
): MediaItem[] {
  const items: MediaItem[] = [];

  // 1. Videos (sorted by order)
  const sortedVideos = [...(recipe.videos ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const video of sortedVideos) {
    if (!video.video) continue;
    items.push({
      type: "video",
      uri: resolveImageUri(video.video, backendBaseUrl),
      posterUri: video.thumbnail ? resolveImageUri(video.thumbnail, backendBaseUrl) : undefined,
    });
  }

  // 2. Gallery images (sorted by order)
  const sortedImages = [...(recipe.images ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const img of sortedImages) {
    if (!img.image) continue;
    items.push({
      type: "image",
      uri: resolveImageUri(img.image, backendBaseUrl),
    });
  }

  return items;
}
