import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { DAY_NAMES, RootStackParamList } from '../types';
import { colors } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AccountScreen() {
  const navigation = useNavigation<Nav>();
  const { session, glp1State, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Account</Text>
      <Text style={styles.email}>{session?.user.email}</Text>

      <Text style={styles.sectionTitle}>GLP-1 profile</Text>
      <View style={styles.card}>
        <Row
          label="Injection day"
          value={glp1State ? DAY_NAMES[glp1State.injection_day] : '—'}
        />
        <Row
          label="Appetite level"
          value={glp1State ? capitalize(glp1State.appetite_level) : '—'}
        />
        <Row
          label="Week in cycle"
          value={glp1State ? `Week ${glp1State.week_in_cycle}` : '—'}
        />
        <Row
          label="Protein goal"
          value={glp1State ? `${glp1State.protein_goal_grams}g / day` : '—'}
          last
        />
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('Setup')}
      >
        <Text style={styles.editButtonText}>Edit GLP-1 profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 64,
  },
  heading: { fontSize: 28, fontWeight: '700', color: colors.text },
  email: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  editButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  editButtonText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  signOutButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  signOutText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
});
