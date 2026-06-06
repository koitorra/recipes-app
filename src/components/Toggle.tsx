import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

// Переключатель в стиле приложения: дорожка accentGreen/lightBorder,
// бегунок всегда белый (без платформенного синего у нативного Switch).
export default function Toggle({ value, onValueChange }: Props) {
  return (
    <TouchableOpacity
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: { width: 46, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center' },
  trackOn: { backgroundColor: Colors.accentGreen },
  trackOff: { backgroundColor: Colors.lightBorder },
  thumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.white },
  thumbOn: { alignSelf: 'flex-end' },
  thumbOff: { alignSelf: 'flex-start' },
});
