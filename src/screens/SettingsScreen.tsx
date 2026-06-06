import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Colors } from '../theme/colors';
import { useSettings } from '../context/SettingsContext';
import { ThemeId, LanguageId, MeasurementSystem } from '../models/types';
import { confirmAction } from '../utils/confirm';
import { useTranslation } from '../i18n/useTranslation';
import SettingPicker, { PickerOption } from '../components/SettingPicker';
import Toggle from '../components/Toggle';

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
    { value: 'be', label: t('settings.langBe') },
    { value: 'kk', label: t('settings.langKk') },
    { value: 'uk', label: t('settings.langUk') },
    { value: 'pl', label: t('settings.langPl') },
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

      {/* Блок «Питание» — опциональный подсчёт калорий */}
      <Text style={styles.sectionLabel}>{t('settings.nutritionSection')}</Text>
      <View style={styles.card}>
        <View style={[styles.switchRow, settings.calorieCounting && styles.switchRowDivider]}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchTitle}>{t('settings.calorieCounting')}</Text>
            <Text style={styles.switchDesc}>{t('settings.calorieCountingDesc')}</Text>
          </View>
          <Toggle
            value={settings.calorieCounting}
            onValueChange={v => updateSettings({ calorieCounting: v })}
          />
        </View>

        {settings.calorieCounting && (
          <View style={styles.switchRow}>
            <View style={styles.switchTextWrap}>
              <Text style={styles.switchTitle}>{t('settings.showMacros')}</Text>
              <Text style={styles.switchDesc}>{t('settings.showMacrosDesc')}</Text>
            </View>
            <Toggle
              value={settings.showMacros}
              onValueChange={v => updateSettings({ showMacros: v })}
            />
          </View>
        )}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          {settings.calorieCounting ? t('settings.calorieNoteOn') : t('settings.calorieNoteOff')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  note: { marginTop: 8, paddingHorizontal: 4 },
  noteText: { fontSize: 13, color: Colors.placeholder, lineHeight: 18 },
  sectionLabel: {
    fontSize: 13, color: Colors.placeholder,
    marginTop: 20, marginBottom: 8, marginLeft: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  card: { backgroundColor: Colors.white, borderRadius: 12, overflow: 'hidden' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 12,
  },
  switchRowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.background },
  switchTextWrap: { flex: 1 },
  switchTitle: { fontSize: 15, color: Colors.text },
  switchDesc: { fontSize: 13, color: Colors.placeholder, marginTop: 2, lineHeight: 17 },
});
