import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { translate, TKey } from './index';

// Хук перевода. Читает текущий язык из SettingsContext, поэтому при смене языка
// все использующие его компоненты перерисовываются автоматически.
export function useTranslation() {
  const { settings } = useSettings();
  const lang = settings.language;

  const t = useCallback(
    (key: TKey, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang]
  );

  return { t, lang };
}
