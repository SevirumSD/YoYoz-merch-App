// Supabase Edge Function: analyze-meal
//
// Receives a base64 meal photo, asks Claude Vision to identify the food and
// estimate protein, then blends the model's confidence with historical
// accuracy for that food (built up from user confirm/correct feedback in
// food_confidence_scores).
//
// Secrets required (supabase secrets set ...):
//   ANTHROPIC_API_KEY  - Anthropic API key
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
});

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type MediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    food_name: {
      type: 'string',
      description:
        'Short, common name of the dish or food, e.g. "Grilled chicken salad". If multiple items, name the overall meal.',
    },
    protein_grams: {
      type: 'number',
      description:
        'Estimated grams of protein in the serving shown in the photo.',
    },
    confidence_score: {
      type: 'integer',
      description:
        'How confident you are in the identification AND the protein estimate combined, from 0 (pure guess) to 100 (certain). Be honest: obscured, ambiguous, or mixed dishes should score lower.',
    },
    is_food: {
      type: 'boolean',
      description: 'False if the image does not appear to contain food.',
    },
  },
  required: ['food_name', 'protein_grams', 'confidence_score', 'is_food'],
  additionalProperties: false,
} as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // The function is deployed with JWT verification on, so the platform has
  // already validated the caller's token; we still resolve the user so the
  // request is tied to a real account.
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data: userData, error: userError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', ''),
  );
  if (userError || !userData.user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let imageBase64: string;
  let mediaType: MediaType;
  try {
    const body = await req.json();
    imageBase64 = body.image_base64;
    mediaType = ALLOWED_MEDIA_TYPES.includes(body.media_type)
      ? body.media_type
      : 'image/jpeg';
    if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
      throw new Error('missing image');
    }
  } catch {
    return json({ error: 'Expected JSON body with image_base64' }, 400);
  }

  let response;
  try {
    response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Identify the food in this photo and estimate the protein content of the serving shown. This is for a nutrition-tracking app for GLP-1 medication users, where hitting a daily protein goal matters most.',
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error('Anthropic API error', err);
    return json({ error: 'Food analysis is temporarily unavailable' }, 502);
  }

  if (response.stop_reason === 'refusal') {
    return json({ error: 'Could not analyze this photo' }, 422);
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return json({ error: 'Could not analyze this photo' }, 422);
  }

  let parsed: {
    food_name: string;
    protein_grams: number;
    confidence_score: number;
    is_food: boolean;
  };
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    return json({ error: 'Could not analyze this photo' }, 422);
  }

  if (!parsed.is_food) {
    return json({ error: "That doesn't look like food — try another photo" }, 422);
  }

  const rawConfidence = Math.max(0, Math.min(100, Math.round(parsed.confidence_score)));

  // Blend with historical accuracy for this food, learned from user
  // confirmations/corrections. Only kicks in once we have a few samples.
  let confidence = rawConfidence;
  const { data: history } = await supabase
    .from('food_confidence_scores')
    .select('correct_count, incorrect_count')
    .eq('food_name', parsed.food_name.trim().toLowerCase())
    .maybeSingle();
  if (history) {
    const total = history.correct_count + history.incorrect_count;
    if (total >= 3) {
      const accuracy = history.correct_count / total;
      confidence = Math.round(rawConfidence * 0.7 + accuracy * 100 * 0.3);
    }
  }

  return json({
    food_name: parsed.food_name.trim(),
    protein_grams: Math.max(0, Math.round(parsed.protein_grams)),
    confidence_score: confidence,
    raw_confidence: rawConfidence,
  });
});
