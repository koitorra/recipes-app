import { LanguageId, MeasurementSystem } from '../models/types';
import { translations } from '../i18n';

// Подписи единиц в имперской системе. Это ТОЛЬКО названия — значения в рецептах
// не пересчитываются (пересчёт появится в будущих версиях). Не зависят от языка.
export const IMPERIAL_UNIT_LABELS: Record<string, string> = {
  'гр': 'lb',
  'мл': 'fl oz',
  'л': 'gal',
  'стакан': 'cup',
  'ч.ложка': 'tsp',
  'ложка': 'tbsp',
  'шт': 'pcs',
};

// Вернуть подпись единицы для текущей системы измерения и языка.
// Хранимое значение единицы всегда каноническое (русское); меняется только показ.
// - imperial → имперские сокращения (язык-независимы);
// - metric → подпись из словаря выбранного языка (en: g/ml/l/cup/...).
export const displayUnit = (
  unit: string,
  system: MeasurementSystem,
  lang: LanguageId
): string => {
  if (system === 'imperial') return IMPERIAL_UNIT_LABELS[unit] ?? unit;
  const units = (translations[lang] ?? translations.ru).units as Record<string, string>;
  return units[unit] ?? unit;
};

// Вернуть подпись тега для текущего языка. Стандартные теги переводятся по
// каноническому ключу; кастомные теги пользователя показываются как введены.
export const displayTag = (tag: string, lang: LanguageId): string => {
  const tags = (translations[lang] ?? translations.ru).tags as Record<string, string>;
  return tags[tag] ?? tag;
};
