import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../i18n/useTranslation';
import { TKey } from '../i18n';

// Обучающая карусель при первом запуске. Показывается, пока в настройках
// onboardingCompleted === false (см. SettingsContext). Повторный запуск из
// настроек просто снова ставит флаг в false. Рендерится на корне (App.tsx)
// внутри Modal, поэтому перекрывает навигацию и таб-бар без возни с z-index.

type Step = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: TKey;
  bodyKey: TKey;
  web?: boolean; // шаг осмыслен только на вебе (хрупкость данных, экран «Домой»)
};

const STEPS: Step[] = [
  { id: 'welcome', icon: 'happy-outline', titleKey: 'onboarding.welcomeTitle', bodyKey: 'onboarding.welcomeBody' },
  { id: 'recipes', icon: 'book-outline', titleKey: 'onboarding.recipesTitle', bodyKey: 'onboarding.recipesBody' },
  { id: 'filters', icon: 'search-outline', titleKey: 'onboarding.filtersTitle', bodyKey: 'onboarding.filtersBody' },
  { id: 'detail', icon: 'reader-outline', titleKey: 'onboarding.detailTitle', bodyKey: 'onboarding.detailBody' },
  { id: 'shopping', icon: 'cart-outline', titleKey: 'onboarding.shoppingTitle', bodyKey: 'onboarding.shoppingBody' },
  { id: 'calendar', icon: 'calendar-outline', titleKey: 'onboarding.calendarTitle', bodyKey: 'onboarding.calendarBody' },
  { id: 'data', icon: 'cloud-upload-outline', titleKey: 'onboarding.dataTitle', bodyKey: 'onboarding.dataBody', web: true },
  { id: 'home', icon: 'phone-portrait-outline', titleKey: 'onboarding.homeTitle', bodyKey: 'onboarding.homeBody', web: true },
];

export default function OnboardingOverlay() {
  const { settings, updateSettings, loaded } = useSettings();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);

  const steps = STEPS.filter(s => (s.web ? Platform.OS === 'web' : true));
  const visible = loaded && !settings.onboardingCompleted;

  // index может «застрять» вне диапазона — подстрахуемся при рендере.
  const current = steps[Math.min(index, steps.length - 1)] ?? steps[0];
  const isFirst = index <= 0;
  const isLast = index >= steps.length - 1;

  const finish = () => {
    updateSettings({ onboardingCompleted: true });
    setIndex(0);
  };

  const goPrev = () => { if (!isFirst) setIndex(i => i - 1); };
  const goNext = () => {
    if (isLast) { finish(); return; }
    setIndex(i => i + 1);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={finish}>
      <View style={[styles.overlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.card}>
          {/* Крестик — закрыть/пропустить */}
          <TouchableOpacity style={styles.closeBtn} onPress={finish} hitSlop={8}>
            <Ionicons name="close-circle" size={28} color={Colors.placeholder} />
          </TouchableOpacity>

          <Text style={styles.title}>{t(current.titleKey)}</Text>

          {/* Область гифки (пока заглушка) */}
          <View style={styles.media}>
            <Ionicons name={current.icon} size={64} color={Colors.cardBackground} />
            <Text style={styles.mediaHint}>GIF</Text>
          </View>

          {/* Управление: ◁  ▷ */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={goPrev} disabled={isFirst} hitSlop={8} style={styles.ctrlBtn}>
              <Ionicons name="chevron-back" size={28} color={isFirst ? Colors.lightBorder : Colors.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={goNext} hitSlop={8} style={styles.ctrlBtn}>
              <Ionicons
                name={isLast ? 'checkmark-circle' : 'chevron-forward'}
                size={isLast ? 30 : 28}
                color={isLast ? Colors.accentGreen : Colors.text}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.body}>{t(current.bodyKey)}</Text>

          {/* Точки-индикаторы */}
          <View style={styles.dots}>
            {steps.map((s, i) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setIndex(i)}
                hitSlop={6}
              >
                <View style={[styles.dot, i === index && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Пропустить (на последнем шаге — уже есть «галочка» завершения) */}
          {!isLast && (
            <TouchableOpacity onPress={finish} style={styles.skipBtn} hitSlop={8}>
              <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 380,
    backgroundColor: Colors.background,
    borderRadius: 24, padding: 20, paddingTop: 16,
    alignItems: 'center',
  },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 4 },
  title: {
    fontSize: 20, fontWeight: '700', color: Colors.text,
    textAlign: 'center', marginBottom: 14,
  },
  media: {
    width: '100%', aspectRatio: 1,
    backgroundColor: Colors.white, borderRadius: 18,
    borderWidth: 2, borderColor: Colors.lightBorder, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  mediaHint: { marginTop: 8, fontSize: 13, color: Colors.placeholder, letterSpacing: 2 },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 64, marginTop: 16,
  },
  ctrlBtn: { padding: 6 },
  body: {
    fontSize: 15, color: Colors.text, lineHeight: 21,
    textAlign: 'center', marginTop: 14, minHeight: 84,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  dot: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: Colors.lightBorder,
  },
  dotActive: { backgroundColor: Colors.accent, width: 11, height: 11, borderRadius: 6 },
  skipBtn: { marginTop: 14, padding: 6 },
  skipText: { fontSize: 14, color: Colors.placeholder, fontWeight: '600' },
});
