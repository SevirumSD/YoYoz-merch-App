import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { DAY_NAMES, Meal, mealName, mealProtein } from '../types';
import { colors, confidenceColor } from '../theme';

export default function DashboardScreen() {
  const { session, glp1State } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMeals = useCallback(async () => {
    if (!session) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('user_meals')
      .select('id, photo_url, ai_result, user_correction, confidence_score, logged_at')
      .eq('user_id', session.user.id)
      .gte('logged_at', startOfDay.toISOString())
      .order('logged_at', { ascending: false });
    setMeals((data as Meal[]) ?? []);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  }

  const goal = glp1State?.protein_goal_grams ?? 0;
  const total = Math.round(meals.reduce((sum, m) => sum + mealProtein(m), 0));
  const pct = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Today</Text>
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>
                You logged{' '}
                <Text style={styles.progressStrong}>
                  {total}g / {goal}g
                </Text>{' '}
                protein today
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
              {glp1State && (
                <Text style={styles.cycleNote}>
                  Week {glp1State.week_in_cycle} · {glp1State.appetite_level}{' '}
                  appetite · injects {DAY_NAMES[glp1State.injection_day]}
                </Text>
              )}
            </View>
            <Text style={styles.subheading}>Meals</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No meals logged yet today. Tap the camera tab to snap your first one.
          </Text>
        }
        renderItem={({ item }) => {
          const corrected = item.user_correction != null;
          return (
            <View style={styles.mealRow}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>
                  {mealName(item)}
                  {corrected && <Text style={styles.correctedTag}>  ✎ corrected</Text>}
                </Text>
                <Text style={styles.mealTime}>
                  {new Date(item.logged_at).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {'  ·  '}
                  <Text style={{ color: confidenceColor(item.confidence_score) }}>
                    {item.confidence_score}%
                  </Text>
                </Text>
              </View>
              <Text style={styles.mealProtein}>{mealProtein(item)}g</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 20, paddingTop: 64, paddingBottom: 32 },
  heading: { fontSize: 28, fontWeight: '700', color: colors.text },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginTop: 16,
  },
  progressLabel: { color: colors.text, fontSize: 15 },
  progressStrong: { color: colors.primary, fontWeight: '700', fontSize: 17 },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  cycleNote: { color: colors.textMuted, fontSize: 12, marginTop: 12 },
  subheading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 28,
    marginBottom: 8,
  },
  empty: { color: colors.textMuted, fontSize: 14, marginTop: 12 },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 10,
  },
  mealInfo: { flex: 1 },
  mealName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  correctedTag: { color: colors.warning, fontSize: 12, fontWeight: '400' },
  mealTime: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  mealProtein: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 12,
  },
});
