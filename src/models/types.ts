// Единицы измерения для ингредиентов
export const UNITS = ['гр', 'мл', 'л', 'стакан', 'ч.ложка', 'ложка', 'шт'];

// Стандартные теги (фильтры)
export const DEFAULT_TAGS = [
  'Духовка',
  'Сковорода',
  'Мультиварка',
  'Вегетарианское',
  'Выпечка',
  'Салат',
];

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  // Пищевая ценность на 100 г / 100 мл продукта. Все поля опциональны:
  // если их нет, ингредиент не участвует в подсчёте и итог помечается «≈».
  kcal100?: number;     // ккал на 100 г/мл
  protein100?: number;  // белки, г на 100 г/мл
  fat100?: number;      // жиры, г на 100 г/мл
  carb100?: number;     // углеводы, г на 100 г/мл
}

export interface Recipe {
  id: string;
  name: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  additionalInfo: string;
  videoLink: string;
  createdAt: number;
  portions?: number;    // число порций в блюде (по умолчанию 1)
}

// Итог пищевой ценности (на блюдо или на порцию).
export interface NutritionTotals {
  kcal: number;
  protein: number;
  fat: number;
  carb: number;
  approximate: boolean; // true, если у части ингредиентов нет данных
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  bought: boolean;
  sourceRecipeId?: string;
}

export interface CalendarEntry {
  date: string;
  recipeIds: string[];
}

// Настройки приложения
export type ThemeId = 'classic';
export type LanguageId = 'ru' | 'en';
export type MeasurementSystem = 'metric' | 'imperial';

export interface AppSettings {
  theme: ThemeId;
  language: LanguageId;
  measurement: MeasurementSystem;
  onboardingCompleted: boolean;
  calorieCounting: boolean;  // главный тумблер функции подсчёта калорий
  showMacros: boolean;       // показывать БЖУ (под-настройка)
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'classic',
  language: 'ru',
  measurement: 'metric',
  onboardingCompleted: false,
  calorieCounting: false,  // по умолчанию ВЫКЛ — никого не пугаем (осознанный opt-in)
  showMacros: true,        // если функция включена, БЖУ по умолчанию видно
};
