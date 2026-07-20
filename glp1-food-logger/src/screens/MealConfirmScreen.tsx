import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AiResult, RootStackParamList } from '../types';
import { colors, confidenceColor } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MealConfirm'>;

type Phase = 'analyzing' | 'review' | 'correcting' | 'saving';

export default function MealConfirmScreen({ route, navigation }: Props) {
  const { photoBase64, photoUri } = route.params;
  const { session } = useAuth();

  const [phase, setPhase] = useState<Phase>('analyzing');
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correctedName, setCorrectedName] = useState('');
  const [correctedProtein, setCorrectedProtein] = useState('');

  const analyze = useCallback(async () => {
    setPhase('analyzing');
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke(
      'analyze-meal',
      { body: { image_base64: photoBase64, media_type: 'image/jpeg' } },
    );
    if (fnError || !data?.food_name) {
      setError(
        fnError?.message ?? data?.error ?? 'Could not analyze this photo.',
      );
      return;
    }
    setResult(data as AiResult);
    setCorrectedName(data.food_name);
    setCorrectedProtein(String(data.protein_grams));
    setPhase('review');
  }, [photoBase64]);

  useEffect(() => {
    analyze();
  }, [analyze]);

  async function uploadPhoto(): Promise<string | null> {
    if (!session) return null;
    const path = `${session.user.id}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('meal-photos')
      .upload(path, decode(photoBase64), { contentType: 'image/jpeg' });
    // Photo storage is best-effort; the log entry matters more than the image.
    return uploadError ? null : path;
  }

  async function saveMeal(correction: { food_name: string; protein_grams: number } | null) {
    if (!session || !result) return;
    setPhase('saving');
    const photoPath = await uploadPhoto();

    const { error: insertError } = await supabase.from('user_meals').insert({
      user_id: session.user.id,
      photo_url: photoPath,
      ai_result: result,
      user_correction: correction,
      confidence_score: result.confidence_score,
    });
    if (insertError) {
      Alert.alert('Save failed', insertError.message);
      setPhase(correction ? 'correcting' : 'review');
      return;
    }

    // Feed the outcome back so future confidence scores learn from it.
    await supabase.rpc('record_food_feedback', {
      p_food_name: result.food_name,
      p_was_correct: correction === null,
      p_confidence: result.raw_confidence ?? result.confidence_score,
    });

    navigation.popToTop();
  }

  function handleCorrectSave() {
    const protein = parseFloat(correctedProtein);
    if (!correctedName.trim() || !Number.isFinite(protein) || protein < 0) {
      Alert.alert('Invalid correction', 'Enter a food name and protein amount.');
      return;
    }
    saveMeal({ food_name: correctedName.trim(), protein_grams: protein });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: photoUri }} style={styles.photo} />

      {phase === 'analyzing' && !error && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.analyzingText}>Identifying your meal…</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={analyze}>
            <Text style={styles.primaryButtonText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Retake photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {result && (phase === 'review' || phase === 'saving') && (
        <View>
          <View style={styles.resultCard}>
            <Text style={styles.foodName}>{result.food_name}</Text>
            <Text style={styles.protein}>
              {result.protein_grams}g protein
              <Text style={styles.proteinSub}> / serving</Text>
            </Text>
            <View style={styles.confidenceRow}>
              <View style={styles.confidenceTrack}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${Math.min(result.confidence_score, 100)}%`,
                      backgroundColor: confidenceColor(result.confidence_score),
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.confidenceText,
                  { color: confidenceColor(result.confidence_score) },
                ]}
              >
                {result.confidence_score}% confident
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => saveMeal(null)}
            disabled={phase === 'saving'}
          >
            {phase === 'saving' ? (
              <ActivityIndicator color="#0F1115" />
            ) : (
              <Text style={styles.primaryButtonText}>✓ Looks good</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setPhase('correcting')}
            disabled={phase === 'saving'}
          >
            <Text style={styles.secondaryButtonText}>✎ Correct it</Text>
          </TouchableOpacity>
        </View>
      )}

      {result && phase === 'correcting' && (
        <View>
          <Text style={styles.label}>Food name</Text>
          <TextInput
            style={styles.input}
            value={correctedName}
            onChangeText={setCorrectedName}
            placeholder="e.g. Grilled chicken salad"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.label}>Protein (grams)</Text>
          <TextInput
            style={styles.input}
            value={correctedProtein}
            onChangeText={setCorrectedProtein}
            keyboardType="decimal-pad"
            placeholder="30"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleCorrectSave}>
            <Text style={styles.primaryButtonText}>Save correction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setPhase('review')}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 20,
  },
  center: { alignItems: 'center', paddingVertical: 24 },
  analyzingText: { color: colors.textMuted, marginTop: 14, fontSize: 15 },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
  },
  foodName: { color: colors.text, fontSize: 22, fontWeight: '700' },
  protein: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  proteinSub: { color: colors.textMuted, fontSize: 14, fontWeight: '400' },
  confidenceRow: { marginTop: 16 },
  confidenceTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  confidenceFill: { height: 8, borderRadius: 4 },
  confidenceText: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: '#0F1115', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  linkText: { color: colors.textMuted, marginTop: 16, fontSize: 14 },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
});
