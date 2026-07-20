export const colors = {
  background: '#0F1115',
  surface: '#1A1D24',
  surfaceLight: '#252933',
  primary: '#4ADE80',
  primaryDark: '#16A34A',
  text: '#F4F5F7',
  textMuted: '#9CA3AF',
  danger: '#F87171',
  warning: '#FBBF24',
  border: '#2E3340',
};

export function confidenceColor(score: number): string {
  if (score >= 75) return colors.primary;
  if (score >= 50) return colors.warning;
  return colors.danger;
}
