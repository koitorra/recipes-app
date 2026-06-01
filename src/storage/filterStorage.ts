import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_TAGS } from '../models/types';

const KEY = '@tags';

// При первом запуске записываем дефолтные теги
export const getAllTags = async (): Promise<string[]> => {
  const json = await AsyncStorage.getItem(KEY);
  if (json) return JSON.parse(json);
  await AsyncStorage.setItem(KEY, JSON.stringify(DEFAULT_TAGS));
  return [...DEFAULT_TAGS];
};

export const saveTags = async (tags: string[]): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(tags));
};

export const addTag = async (tag: string): Promise<void> => {
  const tags = await getAllTags();
  if (!tags.includes(tag)) {
    await saveTags([...tags, tag]);
  }
};

export const removeTag = async (tag: string): Promise<void> => {
  const tags = await getAllTags();
  await saveTags(tags.filter(t => t !== tag));
};
