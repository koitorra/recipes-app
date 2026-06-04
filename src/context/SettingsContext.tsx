import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../models/types';
import { getSettings, saveSettings } from '../storage/settingsStorage';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  // false, пока настройки не подгрузились из хранилища. Нужен, чтобы экраны,
  // зависящие от сохранённого значения (например, онбординг), не мигали на
  // дефолтах до первого чтения.
  loaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  loaded: false,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSettings().then(s => { setSettings(s); setLoaded(true); });
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
