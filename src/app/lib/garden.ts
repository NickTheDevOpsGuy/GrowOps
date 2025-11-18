// src/lib/garden.ts
export const PLANT_ICONS = ["🌱", "🌿", "🌳"] as const;
export type PlantStage = (typeof PLANT_ICONS)[number];
