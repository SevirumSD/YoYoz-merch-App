export type AppetiteLevel = 'high' | 'medium' | 'low';

export interface Glp1State {
  injection_day: number; // 0 = Sunday ... 6 = Saturday
  appetite_level: AppetiteLevel;
  week_in_cycle: number; // 1-4
  protein_goal_grams: number;
}

export interface AiResult {
  food_name: string;
  protein_grams: number;
  confidence_score: number; // 0-100, blended with historical accuracy
  raw_confidence: number; // 0-100, straight from the model
}

export interface UserCorrection {
  food_name: string;
  protein_grams: number;
}

export interface Meal {
  id: string;
  photo_url: string | null;
  ai_result: AiResult;
  user_correction: UserCorrection | null;
  confidence_score: number;
  logged_at: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Setup: undefined;
  Main: undefined;
  MealConfirm: { photoBase64: string; photoUri: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Camera: undefined;
  Account: undefined;
};

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function mealProtein(meal: Meal): number {
  return meal.user_correction?.protein_grams ?? meal.ai_result.protein_grams;
}

export function mealName(meal: Meal): string {
  return meal.user_correction?.food_name ?? meal.ai_result.food_name;
}
