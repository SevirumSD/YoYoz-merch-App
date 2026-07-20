import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AppetiteLevel, DAY_NAMES } from '../types';
import { colors } from '../theme';

const APPETITE_LEVELS: { value: AppetiteLevel; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function SetupScreen() {
  const navigation = useNavigation();
  const { session, glp1State, refreshGlp1State } = useAuth();
  const isEditing = glp1State != null;

  const [injectionDay, setInjectionDay] = useState<number>(
    glp1State?.injection_day ?? new Date().getDay(),
  );
  const [appetite, setAppetite] = useState<AppetiteLevel>(
    glp1State?.appetite_level ?? 'medium',
  );
  const [week, setWeek] = useState<number>(glp1State?.week_in_cycle ?? 1);
  const [proteinGoal, setProteinGoal] = useState<string>(
    String(glp1State?.protein_goal_grams ?? 180),
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const goal = parseInt(proteinGoal, 10);
    if (!Number.isFinite(goal) || goal <= 0 || goal > 500) {
      Alert.alert('Invalid goal', 'Enter a protein goal between 1 and 500 g.');
      return;
    }
    if (!session) return;
    setSaving(true);
    const { error } = await supabase.from('user_glp1_state').upsert(
      {
        user_id: session.user.id,
        injection_day: injectionDay,
        appetite_level: appetite,
        week_in_cycle: week,
        protein_goal_grams: goal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    setSaving(false);
    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }
    await refreshGlp1State();
    if (isEditing && navigation.canGoBack()) navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isEditing ? 'Update your GLP-1 profile' : 'Set up your GLP-1 profile'}
      </Text>
      <Text style={styles.subtitle}>
        We use this to put your protein intake in context across your cycle.
      </Text>

      <Text style={styles.label}>Injection day</Text>
      <View style={styles.row}>
        {DAY_NAMES.map((day, i) => (
          <TouchableOpacity
            key={day}
            style={[styles.chip, injectionDay === i && styles.chipActive]}
            onPress={() => setInjectionDay(i)}
          >
            <Text
              style={[
                styles.chipText,
                injectionDay === i && styles.chipTextActive,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Current appetite level</Text>
      <View style={styles.row}>
        {APPETITE_LEVELS.map((a) => (
          <TouchableOpacity
            key={a.value}
            style={[styles.chipWide, appetite === a.value && styles.chipActive]}
            onPress={() => setAppetite(a.value)}
          >
            <Text
              style={[
                styles.chipText,
                appetite === a.value && styles.chipTextActive,
              ]}
            >
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Week in cycle</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4].map((w) => (
          <TouchableOpacity
            key={w}
            style={[styles.chipWide, week === w && styles.chipActive]}
            onPress={() => setWeek(w)}
          >
            <Text style={[styles.chipText, week === w && styles.chipTextActive]}>
              Week {w}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Daily protein goal (grams)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={proteinGoal}
        onChangeText={setProteinGoal}
        placeholder="180"
        placeholderTextColor={colors.textMuted}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#0F1115" />
        ) : (
          <Text style={styles.buttonText}>
            {isEditing ? 'Save changes' : "Let's go"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 64, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 28,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipWide: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#0F1115' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 36,
  },
  buttonText: { color: '#0F1115', fontSize: 16, fontWeight: '700' },
});
