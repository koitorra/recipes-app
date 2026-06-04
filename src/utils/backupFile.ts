import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

// Кросс-платформенный файловый ввод/вывод для резервных копий.
//
// Сама сборка/восстановление копии живёт в storage/backupStorage.ts и не зависит
// от платформы. Здесь — только то, чем платформы отличаются: как «отдать» файл
// пользователю и как получить его обратно.
//   web    — DOM-API браузера (скачивание ссылкой, <input type="file">).
//   native — запись во временный файл + системный лист «Поделиться»,
//            выбор файла через DocumentPicker.

// --- web ---------------------------------------------------------------------

// Скачать строку как JSON-файл через ссылку (только веб).
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
const pickJsonFileWeb = (): Promise<string | null> =>
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

// --- публичный API -----------------------------------------------------------

// Отдать резервную копию пользователю. На вебе — скачивание; на нативе —
// записать во временный файл и открыть системный лист «Поделиться».
export const exportBackup = async (filename: string, json: string): Promise<void> => {
  if (Platform.OS === 'web') {
    downloadJson(filename, json);
    return;
  }

  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, json);
  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: filename,
    UTI: 'public.json',
  });
};

// Выбрать файл резервной копии и вернуть его содержимое как текст.
// Возвращает null, если пользователь отменил выбор.
export const importBackup = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return pickJsonFileWeb();
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  return FileSystem.readAsStringAsync(result.assets[0].uri);
};
