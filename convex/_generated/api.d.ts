/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as exercises from "../exercises.js";
import type * as food from "../food.js";
import type * as fuelEngine from "../fuelEngine.js";
import type * as nutrition from "../nutrition.js";
import type * as programs from "../programs.js";
import type * as quotes from "../quotes.js";
import type * as routines from "../routines.js";
import type * as routinesLogic from "../routinesLogic.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  exercises: typeof exercises;
  food: typeof food;
  fuelEngine: typeof fuelEngine;
  nutrition: typeof nutrition;
  programs: typeof programs;
  quotes: typeof quotes;
  routines: typeof routines;
  routinesLogic: typeof routinesLogic;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
