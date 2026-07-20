# Protein Lens — GLP-1 food logger

React Native + Expo app for GLP-1 medication users. Snap a photo of a meal,
Claude Vision identifies the food and estimates its protein, you confirm or
correct it, and the meal is logged against your daily protein goal in
Supabase. Corrections feed a per-food confidence model so scores get better
over time.

## Core flow

1. Open the app → **Camera** tab → snap a photo of your meal.
2. The photo is sent to the `analyze-meal` Supabase Edge Function, which calls
   the Claude API (`claude-opus-4-8`) with the image and a strict JSON schema,
   returning `food_name`, `protein_grams`, and `confidence_score` (0–100).
3. The confidence shown is the model's raw score blended with historical
   accuracy for that food (70/30) once at least 3 confirmations/corrections
   exist for it.
4. **Looks good** logs the meal as-is. **Correct it** lets you fix the name
   and protein; the correction is stored in `user_meals.user_correction` and
   counted against that food in `food_confidence_scores`.
5. The **Dashboard** shows "You logged 156g / 180g protein today" with a
   progress bar and today's meals (time + protein + confidence).

## Screens

- **Auth** — email/password sign in and sign up (Supabase Auth)
- **GLP-1 Setup** — injection day, appetite level (high/medium/low), week in
  cycle (1–4), daily protein goal; shown once after first sign-in, editable
  from Account
- **Camera** — live preview + shutter (expo-camera)
- **Meal Confirm** — AI result, confidence bar, confirm/correct buttons
- **Dashboard** — daily protein progress + meal list
- **Account** — GLP-1 state summary, edit profile, sign out

## Setup

### 1. Supabase project

```sh
# from glp1-food-logger/
supabase link --project-ref <your-project-ref>
supabase db push                 # applies supabase/migrations/00001_init.sql
```

The migration creates `user_glp1_state`, `user_meals`, and
`food_confidence_scores` with row-level security, the
`record_food_feedback()` function, and a private `meal-photos` storage
bucket.

In the Supabase dashboard, make sure **Email** auth is enabled
(Authentication → Providers). For quick local testing you can disable
"Confirm email".

### 2. Edge function

```sh
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy analyze-meal
```

The Anthropic key lives only in the edge function — it is never shipped in
the app bundle.

### 3. App

```sh
cp .env.example .env   # fill in EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
npx expo start
```

Run it on a physical device with Expo Go (the camera needs real hardware;
simulators show a black preview).

## How confidence "training" works

- Every confirm/correct calls `record_food_feedback(food_name, was_correct,
  raw_confidence)`, which upserts a row in `food_confidence_scores`
  (correct/incorrect counts + running average of the model's raw confidence).
- On each analysis, the edge function looks the food up and, once ≥3 samples
  exist, blends: `confidence = 0.7 × model + 0.3 × historical accuracy`.
- Foods the model habitually gets wrong therefore surface with visibly lower
  confidence, nudging the user to double-check.

## Project layout

```
App.tsx                     entry: AuthProvider + navigator
src/
  lib/supabase.ts           Supabase client (AsyncStorage-backed sessions)
  context/AuthContext.tsx   session + GLP-1 profile state
  navigation/index.tsx      auth → setup → tabs routing
  screens/                  Auth, Setup, Camera, MealConfirm, Dashboard, Account
  theme.ts                  colors + confidence color scale
supabase/
  migrations/00001_init.sql schema, RLS, feedback fn, storage bucket
  functions/analyze-meal/   Claude Vision edge function
```
