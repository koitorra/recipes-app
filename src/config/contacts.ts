// Контакты и внешние ссылки приложения.
//
// Значения берутся из переменных окружения EXPO_PUBLIC_*, которые Expo/Metro
// статически подставляет в сборку. Реальные данные хранятся в .env (локально,
// в .gitignore) и в GitHub Actions secrets (для веб-деплоя). В репозитории
// остаются только эти заглушки-fallback — личных данных в коде нет.
//
// Важно: обращаться нужно ровно к литералу process.env.EXPO_PUBLIC_X,
// иначе подстановка при сборке не сработает.
export const Contacts = {
  boostyUrl: process.env.EXPO_PUBLIC_BOOSTY_URL ?? '',
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '',
  googleFormUrl: process.env.EXPO_PUBLIC_GOOGLE_FORM_URL ?? '',
  yandexFormUrl: process.env.EXPO_PUBLIC_YANDEX_FORM_URL ?? '',
};

// Контакт задан, если непустая строка.
export const hasContact = (value: string): boolean => value.trim().length > 0;
