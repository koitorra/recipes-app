import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../theme/colors';
import { ShoppingItem } from '../models/types';
import { generateId } from '../utils/id';
import { animateLayout } from '../utils/layout';
import {
  getShoppingList, addShoppingItem, toggleBought,
  removeShoppingItem, clearBoughtItems,
} from '../storage/shoppingStorage';
import { useSettings } from '../context/SettingsContext';
import { displayUnit } from '../utils/units';
import { useTranslation } from '../i18n/useTranslation';

export default function ShoppingListScreen() {
  const { settings } = useSettings();
  const { t, lang } = useTranslation();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  const reload = async () => setItems(await getShoppingList());

  useFocusEffect(useCallback(() => { reload(); }, []));

  const handleAdd = async () => {
    if (!newItemName.trim()) return;
    await addShoppingItem({ id: generateId(), name: newItemName.trim(), bought: false });
    setNewItemName('');
    await reload();
  };

  const handleToggle = async (id: string) => {
    await toggleBought(id);
    animateLayout();
    await reload();
  };

  const handleRemove = async (id: string) => {
    await removeShoppingItem(id);
    animateLayout();
    await reload();
  };

  const handleClearBought = async () => {
    await clearBoughtItems();
    animateLayout();
    await reload();
  };

  const hasBought = items.some(i => i.bought);

  const formatAmount = (item: ShoppingItem) =>
    item.amount && item.amount > 0
      ? `${item.amount} ${displayUnit(item.unit || 'гр', settings.measurement, lang)}`
      : '';

  const handleCopy = async () => {
    const pending = items.filter(i => !i.bought);
    if (pending.length === 0) {
      Alert.alert(t('shopping.listEmptyTitle'), t('shopping.nothingToCopy'));
      return;
    }
    const text = pending
      .map(item => {
        const amount = formatAmount(item);
        return amount ? `• ${item.name} — ${amount}` : `• ${item.name}`;
      })
      .join('\n');
    await Clipboard.setStringAsync(text);
    Alert.alert(t('common.done'), t('shopping.copied'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={t('shopping.addPlaceholder')}
          placeholderTextColor={Colors.placeholder}
          value={newItemName}
          onChangeText={setNewItemName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          maxLength={60}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
          <Ionicons name="copy-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const amount = formatAmount(item);
          return (
            <View style={styles.itemRow}>
              <TouchableOpacity
                style={[styles.checkbox, item.bought && styles.checkboxChecked]}
                onPress={() => handleToggle(item.id)}
              >
                {item.bought && <Ionicons name="checkmark" size={16} color={Colors.white} />}
              </TouchableOpacity>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, item.bought && styles.itemBought]}>{item.name}</Text>
                {amount !== '' && (
                  <Text style={[styles.itemAmount, item.bought && styles.itemBought]}>{amount}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => handleRemove(item.id)}>
                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('shopping.empty')}</Text>
          </View>
        }
      />

      {hasBought && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearBought}>
          <Text style={styles.clearBtnText}>{t('shopping.clearBought')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inputRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 8, gap: 10,
  },
  input: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.text,
  },
  addBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: Colors.accentGreen,
    justifyContent: 'center', alignItems: 'center',
  },
  copyBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.lightBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  list: { padding: 16 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 10, padding: 12, marginBottom: 8,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.lightBorder,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  checkboxChecked: { backgroundColor: Colors.accentGreen, borderColor: Colors.accentGreen },
  itemInfo: {
    flex: 1, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', marginRight: 10,
  },
  itemName: { fontSize: 15, color: Colors.text, flex: 1 },
  itemAmount: { fontSize: 14, color: Colors.text, fontWeight: '600', marginLeft: 8 },
  itemBought: { textDecorationLine: 'line-through', opacity: 0.4 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 15, color: Colors.text, opacity: 0.5 },
  clearBtn: {
    margin: 16, padding: 14, borderRadius: 12,
    backgroundColor: Colors.danger, alignItems: 'center',
  },
  clearBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
