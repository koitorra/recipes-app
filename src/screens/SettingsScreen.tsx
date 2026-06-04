import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../theme/colors';
import { useSettings } from '../context/SettingsContext';
import { ThemeId, LanguageId, MeasurementSystem } from '../models/types';
import { confirmAction } from '../utils/confirm';
import { useTranslation } from '../i18n/useTranslation';
import SettingPicker, { PickerOption } from '../components/SettingPicker';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();

  const themeOptions: PickerOption<ThemeId>[] = [
    { value: 'classic', label: t('settings.themeClassic') },
  ];

  // Названия языков остаются на родном языке (не переводятся).
  const languageOptions: PickerOption<LanguageId>[] = [
    { value: 'ru', label: t('settings.langRu') },
    { value: 'en', label: t('settings.langEn') },
  ];

  const measurementOptions: PickerOption<MeasurementSystem>[] = [
    { value: 'metric', label: t('settings.metric') },
    { value: 'imperial', label: t('settings.imperial') },
  ];

  const handleMeasurement = (value: MeasurementSystem) => {
    if (value === settings.measurement) return;
    if (value === 'imperial') {
      confirmAction(
        t('settings.changeMeasureTitle'),
        t('settings.changeMeasureMsg'),
        t('settings.switch'),
        () => updateSettings({ measurement: 'imperial' }),
        t('common.cancel')
      );
    } else {
      updateSettings({ measurement: 'metric' });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SettingPicker
        label={t('settings.theme')}
        value={settings.theme}
        options={themeOptions}
        onSelect={value => updateSettings({ theme: value })}
      />

      <SettingPicker
        label={t('settings.language')}
        value={settings.language}
        options={languageOptions}
        onSelect={value => updateSettings({ language: value })}
      />

      <SettingPicker
        label={t('settings.measurement')}
        value={settings.measurement}
        options={measurementOptions}
        onSelect={handleMeasurement}
      />

      <View style={styles.note}>
        <Text style={styles.noteText}>{t('settings.note')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  note: { marginTop: 8, paddingHorizontal: 4 },
  noteText: { fontSize: 13, color: Colors.placeholder, lineHeight: 18 },
});
