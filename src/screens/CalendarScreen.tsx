import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, StyleSheet,
} from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { CalendarEntry, Recipe } from '../models/types';
import { getAllRecipes } from '../storage/recipeStorage';
import { animateLayout } from '../utils/layout';
import {
  getCalendarEntries, getEntriesForDate,
  addRecipeToDate, removeRecipeFromDate,
} from '../storage/calendarStorage';

// Русская локализация
LocaleConfig.locales['ru'] = {
  monthNames: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ],
  monthNamesShort: [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
  ],
  dayNames: [
    'Воскресенье', 'Понедельник', 'Вторник', 'Среда',
    'Четверг', 'Пятница', 'Суббота',
  ],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Сегодня',
};
LocaleConfig.defaultLocale = 'ru';

export default function CalendarScreen() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateRecipeIds, setDateRecipeIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const loadData = async () => {
    const [cal, recipes] = await Promise.all([getCalendarEntries(), getAllRecipes()]);
    setEntries(cal);
    setAllRecipes(recipes);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  // Маркеры на датах
  const markedDates: Record<string, any> = {};
  for (const entry of entries) {
    markedDates[entry.date] = { marked: true, dotColor: Colors.accent };
  }
  if (selectedDate) {
    markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: Colors.accentGreen };
  }

  const handleDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);
    setDateRecipeIds(await getEntriesForDate(day.dateString));
    setShowModal(true);
  };

  const handleAddRecipe = async (recipeId: string) => {
    if (!selectedDate) return;
    await addRecipeToDate(selectedDate, recipeId);
    setDateRecipeIds(await getEntriesForDate(selectedDate));
    setShowPicker(false);
    await loadData();
  };

  const handleRemoveRecipe = async (recipeId: string) => {
    if (!selectedDate) return;
    await removeRecipeFromDate(selectedDate, recipeId);
    animateLayout();
    setDateRecipeIds(await getEntriesForDate(selectedDate));
    await loadData();
  };

  const getRecipeName = (id: string) =>
    allRecipes.find(r => r.id === id)?.name ?? 'Неизвестный рецепт';

  const availableRecipes = allRecipes.filter(r => !dateRecipeIds.includes(r.id));

  const closeModal = () => { setShowModal(false); setShowPicker(false); };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          calendarBackground: Colors.background,
          todayTextColor: Colors.accent,
          selectedDayBackgroundColor: Colors.accentGreen,
          dotColor: Colors.accent,
          arrowColor: Colors.text,
          monthTextColor: Colors.text,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.lightBorder,
          textSectionTitleColor: Colors.text,
        }}
        firstDay={1}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDate}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {!showPicker ? (
              <>
                {dateRecipeIds.length === 0 ? (
                  <Text style={styles.emptyText}>Нет запланированных рецептов</Text>
                ) : (
                  <FlatList
                    data={dateRecipeIds}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                      <View style={styles.recipeRow}>
                        <Text style={styles.recipeName}>{getRecipeName(item)}</Text>
                        <TouchableOpacity onPress={() => handleRemoveRecipe(item)}>
                          <Ionicons name="close-circle" size={22} color={Colors.danger} />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                )}
                <TouchableOpacity style={styles.addRecipeBtn} onPress={() => setShowPicker(true)}>
                  <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
                  <Text style={styles.addRecipeBtnText}>Добавить рецепт</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.pickerTitle}>Выберите рецепт:</Text>
                {availableRecipes.length === 0 ? (
                  <Text style={styles.emptyText}>Все рецепты уже добавлены</Text>
                ) : (
                  <FlatList
                    data={availableRecipes}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.pickerItem} onPress={() => handleAddRecipe(item.id)}>
                        <Text style={styles.pickerItemText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
                <TouchableOpacity style={styles.backBtn} onPress={() => setShowPicker(false)}>
                  <Text style={styles.backBtnText}>Назад</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.text, opacity: 0.5, textAlign: 'center', paddingVertical: 20 },
  recipeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 10, padding: 12, marginBottom: 8,
  },
  recipeName: { fontSize: 15, color: Colors.text, flex: 1 },
  addRecipeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.accentGreen, borderRadius: 12, padding: 12, marginTop: 10, gap: 6,
  },
  addRecipeBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  pickerTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 10 },
  pickerItem: { backgroundColor: Colors.cardBackground, borderRadius: 10, padding: 14, marginBottom: 8 },
  pickerItemText: { fontSize: 15, color: Colors.text },
  backBtn: { alignItems: 'center', padding: 12, marginTop: 8 },
  backBtnText: { fontSize: 15, color: Colors.accent, fontWeight: '600' },
});
