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
