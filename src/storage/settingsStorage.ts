import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_SETTINGS } from '../models/types';

const KEY = '@settings';

export const getSettings = async (): Promise<AppSettings> => {
  const json = await AsyncStorage.getItem(KEY);
  // Мердж с дефолтами — на случай, если в будущем добавятся новые поля.
  return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
};
