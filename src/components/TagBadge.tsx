import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export type TagState = 'none' | 'include' | 'exclude';

interface Props {
  label: string;
  active?: boolean;
  state?: TagState;
  onPress: () => void;
}

export default function TagBadge({ label, active, state, onPress }: Props) {
  // Совместимость: если передан только active, считаем include/none
  const resolved: TagState = state ?? (active ? 'include' : 'none');
  const isInclude = resolved === 'include';
  const isExclude = resolved === 'exclude';

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        isInclude && styles.badgeActive,
        isExclude && styles.badgeExclude,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, (isInclude || isExclude) && styles.textActive]}>
        {isExclude ? `− ${label}` : label}
      </Text>
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
  badgeExclude: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  text: {
    fontSize: 13,
    color: Colors.text,
  },
  textActive: {
    color: Colors.white,
  },
});
