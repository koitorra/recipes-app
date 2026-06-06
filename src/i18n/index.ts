import { LanguageId } from '../models/types';
import { ru } from './ru';
import { en } from './en';
import { be } from './be';
import { kk } from './kk';
import { uk } from './uk';
import { pl } from './pl';

// Карта язык → словарь. Чтобы добавить язык: импортировать его файл и добавить сюда.
export const translations = { ru, en, be, kk, uk, pl } as const;

export type Dictionary = typeof ru;

// Точечные пути только к строковым листам словаря (массивы и объекты-карты
// исключены — к ним обращаются напрямую через translations[lang]).
type StringPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends readonly any[]
    ? never
    : T[K] extends object
    ? `${K}.${StringPaths<T[K]>}`
    : never;
}[keyof T & string];

export type TKey = StringPaths<Dictionary>;

type Params = Record<string, string | number>;

// Подставить {param} значениями из params.
const interpolate = (template: string, params?: Params): string => {
  if (!params) return template;
  return Object.keys(params).reduce(
    (str, key) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(params[key])),
    template
  );
};

// Перевести ключ для указанного языка. Если ключ/язык не найден — мягко
// откатываемся (на русский, затем на сам ключ), чтобы UI не падал.
export function translate(lang: LanguageId, key: TKey, params?: Params): string {
  const dict = translations[lang] ?? translations.ru;
  const lookup = (d: any) =>
    key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), d);
  const raw = lookup(dict) ?? lookup(translations.ru);
  return typeof raw === 'string' ? interpolate(raw, params) : key;
}
