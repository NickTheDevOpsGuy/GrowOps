// index.ts — single responsibility: collect icons + export the array
import { Seed } from "./Seed";
import { Sprout } from "./Sprout";
import { Bud } from "./Bud";
import { Bloom } from "./Bloom";

// unified export so the rest of the app uses a clean seam
export const PLANT_STAGES = [Seed, Sprout, Bud, Bloom] as const;

// optional: named exports if you ever need them directly
export { Seed, Sprout, Bud, Bloom };
