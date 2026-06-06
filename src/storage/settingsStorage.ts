import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { AppSettings, DEFAULT_SETTINGS, LanguageId } from '../models/types';

const KEY = '@settings';

// Поддерживаемые языки интерфейса. Для языка системы, которого тут нет
// (немецкий, китайский и т.п.), используем английский как общий fallback.
const SUPPORTED: LanguageId[] = ['ru', 'en', 'be', 'kk', 'uk', 'pl'];
const FALLBACK_LANGUAGE: LanguageId = 'en';

// Язык системы (веб — язык браузера, Android/iOS — язык устройства), если он
// у нас поддерживается. Иначе — английский. Используется ТОЛЬКО при первом
// запуске; явный выбор пользователя потом всегда главнее.
function detectLanguage(): LanguageId {
  try {
    const code = getLocales()[0]?.languageCode?.toLowerCase();
    return (SUPPORTED as string[]).includes(code ?? '')
      ? (code as LanguageId)
      : FALLBACK_LANGUAGE;
  } catch {
    // На всякий случай: если определить язык не удалось — не роняем загрузку настроек.
    return FALLBACK_LANGUAGE;
  }
}

export const getSettings = async (): Promise<AppSettings> => {
  const json = await AsyncStorage.getItem(KEY);
  // Мердж с дефолтами — на случай, если в будущем добавятся новые поля.
  if (json) return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
  // Первый запуск (настроек ещё нет) — берём язык системы.
  return { ...DEFAULT_SETTINGS, language: detectLanguage() };
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
};
