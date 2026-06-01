import { LayoutAnimation, Platform } from 'react-native';

// Анимация раскрытия/сворачивания — не работает в вебе
export function animateLayout() {
  if (Platform.OS !== 'web') {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }
}
