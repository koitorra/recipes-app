import { Alert, Platform } from 'react-native';

// Кросс-платформенное подтверждение действия.
// На вебе Alert.alert от react-native не показывает кнопки и не вызывает
// колбэки, поэтому используем нативный window.confirm.
export function confirmDestructive(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void
): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: 'Отмена', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
