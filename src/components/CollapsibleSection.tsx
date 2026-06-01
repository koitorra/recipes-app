import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { animateLayout } from '../utils/layout';

interface Props {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({ title, defaultExpanded = false, children }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    animateLayout();
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggle}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.text} />
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
});
