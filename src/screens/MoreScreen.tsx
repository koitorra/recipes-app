import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { MoreStackParamList } from '../navigation/types';
import { Contacts, hasContact } from '../config/contacts';
import { buildBackup, restoreBackup } from '../storage/backupStorage';
import { confirmDestructive } from '../utils/confirm';
import { useTranslation } from '../i18n/useTranslation';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreMain'>;

// Скачать строку как JSON-файл (только веб: используем DOM-API браузера).
const downloadJson = (filename: string, json: string) => {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Открыть диалог выбора файла и вернуть его содержимое как текст (только веб).
const pickJsonFile = (): Promise<string | null> =>
  new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });

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

export default function MoreScreen({ navigation }: Props) {
  const { t } = useTranslation();

  // Открыть внешнюю ссылку (тот же приём, что в RecipeDetailScreen).
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert(t('common.error'), t('more.openLinkError'))
    );
  };

  // Контакт не настроен (пустая переменная окружения).
  const showNotConfigured = () =>
    Alert.alert(t('more.notConfiguredTitle'), t('more.notConfiguredMsg'));

  const openBoosty = () =>
    hasContact(Contacts.boostyUrl) ? openLink(Contacts.boostyUrl) : showNotConfigured();

  const openEmail = () =>
    hasContact(Contacts.supportEmail)
      ? openLink(`mailto:${Contacts.supportEmail}?subject=${encodeURIComponent(t('more.emailSubject'))}`)
      : showNotConfigured();

  const openGoogleForm = () =>
    hasContact(Contacts.googleFormUrl) ? openLink(Contacts.googleFormUrl) : showNotConfigured();

  const openYandexForm = () =>
    hasContact(Contacts.yandexFormUrl) ? openLink(Contacts.yandexFormUrl) : showNotConfigured();

  // Создать и скачать резервную копию всех данных.
  const handleCreateBackup = async () => {
    try {
      const json = await buildBackup();
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(`recipes-backup-${date}.json`, json);
      Alert.alert(t('common.done'), t('more.backupSaved'));
    } catch {
      Alert.alert(t('common.error'), t('more.backupError'));
    }
  };

  // Выбрать файл копии и восстановить данные (с подтверждением — операция
  // перезаписывает текущие рецепты, фильтры и календарь).
  const handleImportBackup = async () => {
    const json = await pickJsonFile();
    if (!json) return;
    confirmDestructive(
      t('more.importTitle'),
      t('more.importMsg'),
      t('more.import'),
      async () => {
        try {
          const c = await restoreBackup(json);
          Alert.alert(
            t('common.done'),
            t('more.restored', { recipes: c.recipes, tags: c.tags, calendar: c.calendar })
          );
        } catch {
          Alert.alert(t('common.error'), t('more.importError'));
        }
      },
      t('common.cancel')
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Section title={t('more.support')}>
        <Row icon="heart-outline" iconColor={Colors.accent} label={t('more.boosty')} onPress={openBoosty} isLast />
      </Section>

      <Section title={t('more.feedback')}>
        <Row icon="mail-outline" label={t('more.email')} onPress={openEmail} />
        <Row icon="document-text-outline" label={t('more.googleForm')} onPress={openGoogleForm} />
        <Row icon="chatbubble-ellipses-outline" label={t('more.yandexForm')} onPress={openYandexForm} isLast />
      </Section>

      {Platform.OS === 'web' && (
        <Section title={t('more.data')}>
          <Row icon="cloud-upload-outline" label={t('more.createBackup')} onPress={handleCreateBackup} />
          <Row icon="cloud-download-outline" label={t('more.importBackup')} onPress={handleImportBackup} isLast />
        </Section>
      )}

      <Section title={t('more.settings')}>
        <Row icon="settings-outline" label={t('more.settingsRow')} onPress={() => navigation.navigate('Settings')} isLast />
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
