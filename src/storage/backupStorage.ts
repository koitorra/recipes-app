import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, CalendarEntry } from '../models/types';
import { getAllRecipes } from './recipeStorage';
import { getAllTags } from './filterStorage';
import { getCalendarEntries } from './calendarStorage';

// Резервная копия данных приложения в формате JSON.
//
// Зачем: на вебе AsyncStorage хранится в localStorage браузера, и очистка
// кэша/данных сайта стирает все рецепты. Экспорт в отдельный файл позволяет
// пользователю самому держать резервную копию и восстановить её при потере.
//
// В копию входят рецепты, кастомные фильтры (теги) и календарь.
// Список покупок (@shopping) сознательно не сохраняем — это временные данные.

const KEYS = {
  recipes: '@recipes',
  tags: '@tags',
  calendar: '@calendar',
} as const;

// Версия СТРУКТУРЫ файла бэкапа (не версия приложения!). Меняется только если
// изменится формат самого файла, чтобы будущий код мог распознать старые копии.
const CURRENT_FORMAT_VERSION = 1;

export interface BackupFile {
  app: 'recipes-app';
  formatVersion: number;
  exportedAt: string;
  data: {
    recipes: Recipe[];
    tags: string[];
    calendar: CalendarEntry[];
  };
}

// Собрать резервную копию всех данных в виде форматированной JSON-строки.
export const buildBackup = async (): Promise<string> => {
  const [recipes, tags, calendar] = await Promise.all([
    getAllRecipes(),
    getAllTags(),
    getCalendarEntries(),
  ]);

  const backup: BackupFile = {
    app: 'recipes-app',
    formatVersion: CURRENT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data: { recipes, tags, calendar },
  };

  return JSON.stringify(backup, null, 2);
};

// Проверить, что распарсенный объект похож на нашу резервную копию.
const isValidBackup = (obj: any): obj is BackupFile =>
  !!obj &&
  typeof obj === 'object' &&
  !!obj.data &&
  Array.isArray(obj.data.recipes) &&
  Array.isArray(obj.data.tags) &&
  Array.isArray(obj.data.calendar);

// Восстановить данные из JSON-строки. Перезаписывает текущие рецепты,
// фильтры и календарь. Бросает ошибку, если файл невалиден — чтобы битый
// или чужой файл не затёр хранилище.
export const restoreBackup = async (
  json: string
): Promise<{ recipes: number; tags: number; calendar: number }> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Файл повреждён или это не JSON');
  }

  if (!isValidBackup(parsed)) {
    throw new Error('Это не похоже на резервную копию приложения');
  }

  const { recipes, tags, calendar } = parsed.data;
  await Promise.all([
    AsyncStorage.setItem(KEYS.recipes, JSON.stringify(recipes)),
    AsyncStorage.setItem(KEYS.tags, JSON.stringify(tags)),
    AsyncStorage.setItem(KEYS.calendar, JSON.stringify(calendar)),
  ]);

  return {
    recipes: recipes.length,
    tags: tags.length,
    calendar: calendar.length,
  };
};
