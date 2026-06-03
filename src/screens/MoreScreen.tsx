import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Contacts, hasContact } from '../config/contacts';

// Открыть внешнюю ссылку (тот же приём, что в RecipeDetailScreen).
const openLink = (url: string) => {
  Linking.openURL(url).catch(() =>
    Alert.alert('Ошибка', 'Не удалось открыть ссылку')
  );
};

// Заглушка для ещё не реализованных функций.
const showSoon = () =>
  Alert.alert('Скоро', 'Эта функция появится в следующих версиях приложения');

// Контакт не настроен (пустая переменная окружения).
const showNotConfigured = () =>
  Alert.alert('Не настроено', 'Контакт пока не указан разработчиком');

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  iconColor?: string;
  isLast?: boolean;
};

function Row({ icon, label, onPress, iconColor, isLast }: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Ionicons name={icon} size={22} color={iconColor || Colors.text} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.placeholder} />
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export default function MoreScreen() {
  const openBoosty = () =>
    hasContact(Contacts.boostyUrl) ? openLink(Contacts.boostyUrl) : showNotConfigured();

  const openEmail = () =>
    hasContact(Contacts.supportEmail)
      ? openLink(`mailto:${Contacts.supportEmail}?subject=${encodeURIComponent('Обратная связь — Кулинарная книга')}`)
      : showNotConfigured();

  const openGoogleForm = () =>
    hasContact(Contacts.googleFormUrl) ? openLink(Contacts.googleFormUrl) : showNotConfigured();

  const openYandexForm = () =>
    hasContact(Contacts.yandexFormUrl) ? openLink(Contacts.yandexFormUrl) : showNotConfigured();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Section title="Поддержка разработчика">
        <Row icon="heart-outline" iconColor={Colors.accent} label="Поддержать на Boosty" onPress={openBoosty} isLast />
      </Section>

      <Section title="Обратная связь и помощь">
        <Row icon="mail-outline" label="Написать на почту" onPress={openEmail} />
        <Row icon="document-text-outline" label="Опрос (Google Форма)" onPress={openGoogleForm} />
        <Row icon="chatbubble-ellipses-outline" label="Опрос (Яндекс Форма)" onPress={openYandexForm} isLast />
      </Section>

      <Section title="Данные">
        <Row icon="cloud-upload-outline" label="Создать резервную копию рецептов" onPress={showSoon} />
        <Row icon="cloud-download-outline" label="Импортировать резервную копию" onPress={showSoon} isLast />
      </Section>

      <Section title="Настройки">
        <Row icon="settings-outline" label="Тема, язык, единицы измерения" onPress={showSoon} isLast />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13, color: Colors.placeholder,
    marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white, borderRadius: 12, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.background,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { marginRight: 14, width: 24, textAlign: 'center' },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.text },
});
