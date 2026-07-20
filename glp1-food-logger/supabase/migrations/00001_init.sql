-- GLP-1 food logger: schema, RLS, feedback function, storage bucket.

CREATE TABLE user_glp1_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  injection_day INT,
  appetite_level TEXT,
  week_in_cycle INT,
  protein_goal_grams INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE user_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  photo_url TEXT,
  ai_result JSONB,
  user_correction JSONB,
  confidence_score INT,
  logged_at TIMESTAMP DEFAULT now()
);

CREATE TABLE food_confidence_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT UNIQUE,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  avg_confidence DECIMAL(3,2),
  last_updated TIMESTAMP DEFAULT now()
);

CREATE INDEX user_meals_user_logged_idx ON user_meals (user_id, logged_at DESC);

-- Row Level Security -------------------------------------------------------

ALTER TABLE user_glp1_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_confidence_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own glp1 state" ON user_glp1_state
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own meals" ON user_meals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Confidence stats are aggregate, non-personal data. Anyone signed in can
-- read them; writes go only through the record_food_feedback function below.
CREATE POLICY "read confidence scores" ON food_confidence_scores
  FOR SELECT TO authenticated USING (true);

-- Keep updated_at fresh on profile edits.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_glp1_state_updated_at
  BEFORE UPDATE ON user_glp1_state
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Confidence feedback ------------------------------------------------------
-- Called after every confirm/correct. avg_confidence stores the running mean
-- of the model's raw confidence as a 0-1 fraction (DECIMAL(3,2)).

CREATE OR REPLACE FUNCTION record_food_feedback(
  p_food_name TEXT,
  p_was_correct BOOLEAN,
  p_confidence INT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fraction DECIMAL := LEAST(GREATEST(p_confidence, 0), 100) / 100.0;
BEGIN
  INSERT INTO food_confidence_scores (food_name, correct_count, incorrect_count, avg_confidence, last_updated)
  VALUES (
    lower(trim(p_food_name)),
    CASE WHEN p_was_correct THEN 1 ELSE 0 END,
    CASE WHEN p_was_correct THEN 0 ELSE 1 END,
    v_fraction,
    now()
  )
  ON CONFLICT (food_name) DO UPDATE SET
    correct_count = food_confidence_scores.correct_count + CASE WHEN p_was_correct THEN 1 ELSE 0 END,
    incorrect_count = food_confidence_scores.incorrect_count + CASE WHEN p_was_correct THEN 0 ELSE 1 END,
    avg_confidence = ROUND(
      (
        COALESCE(food_confidence_scores.avg_confidence, 0)
          * (food_confidence_scores.correct_count + food_confidence_scores.incorrect_count)
        + v_fraction
      ) / (food_confidence_scores.correct_count + food_confidence_scores.incorrect_count + 1),
      2
    ),
    last_updated = now();
END;
$$;

REVOKE ALL ON FUNCTION record_food_feedback(TEXT, BOOLEAN, INT) FROM public;
GRANT EXECUTE ON FUNCTION record_food_feedback(TEXT, BOOLEAN, INT) TO authenticated;

-- Storage ------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-photos', 'meal-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "upload own meal photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'meal-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "read own meal photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'meal-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
