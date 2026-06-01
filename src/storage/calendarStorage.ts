import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEntry } from '../models/types';

const KEY = '@calendar';

export const getCalendarEntries = async (): Promise<CalendarEntry[]> => {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
};

export const getEntriesForDate = async (date: string): Promise<string[]> => {
  const entries = await getCalendarEntries();
  return entries.find(e => e.date === date)?.recipeIds ?? [];
};

export const addRecipeToDate = async (date: string, recipeId: string): Promise<void> => {
  const entries = await getCalendarEntries();
  const entry = entries.find(e => e.date === date);
  if (entry) {
    if (!entry.recipeIds.includes(recipeId)) entry.recipeIds.push(recipeId);
  } else {
    entries.push({ date, recipeIds: [recipeId] });
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
};

export const removeRecipeFromDate = async (date: string, recipeId: string): Promise<void> => {
  const entries = await getCalendarEntries();
  const entry = entries.find(e => e.date === date);
  if (entry) {
    entry.recipeIds = entry.recipeIds.filter(id => id !== recipeId);
  }
  // Удаляем пустые записи
  const cleaned = entries.filter(e => e.recipeIds.length > 0);
  await AsyncStorage.setItem(KEY, JSON.stringify(cleaned));
};
