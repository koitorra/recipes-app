import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export interface PickerOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label: string;
  value: T;
  options: PickerOption<T>[];
  onSelect: (value: T) => void;
}

// Строка-«дропдаун»: текущий выбор + модалка со списком опций.
// Визуально повторяет модалку выбора единиц из AddRecipeScreen.
export default function SettingPicker<T extends string>({ label, value, options, onSelect }: Props<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === value);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={styles.fieldValue}>{current?.label ?? value}</Text>
        <Ionicons name="chevron-down" size={18} color={Colors.placeholder} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={styles.option}
                onPress={() => { setOpen(false); onSelect(opt.value); }}
              >
                <Text style={[styles.optionText, opt.value === value && styles.optionTextActive]}>
                  {opt.label}
                </Text>
                {opt.value === value && (
                  <Ionicons name="checkmark" size={18} color={Colors.accentGreen} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: { fontSize: 13, color: Colors.placeholder, marginBottom: 6, marginLeft: 4 },
  field: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
  },
  fieldValue: { fontSize: 15, color: Colors.text },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  modal: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, width: 260 },
  modalTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 12, textAlign: 'center' },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 8,
    borderBottomWidth: 0.5, borderBottomColor: Colors.lightBorder,
  },
  optionText: { fontSize: 15, color: Colors.text },
  optionTextActive: { fontWeight: '600', color: Colors.accentGreen },
});
