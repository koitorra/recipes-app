import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function TagBadge({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.badge, active && styles.badgeActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.text,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeActive: {
    backgroundColor: Colors.accentGreen,
    borderColor: Colors.accentGreen,
  },
  text: {
    fontSize: 13,
    color: Colors.text,
  },
  textActive: {
    color: Colors.white,
  },
});
