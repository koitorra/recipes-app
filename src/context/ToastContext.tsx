import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

// Лёгкий провайдер всплывающих подсказок (toast). Показывает выезжающую сверху
// плашку с сообщением, которая сама исчезает через пару секунд. Сверху — чтобы
// не перекрывать нижнее меню вкладок. Доступен всем
// экранам через хук useToast(). Анимация на Animated, поэтому работает и в вебе
// (через react-native-web); нативный драйвер выключаем на web.

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

const VISIBLE_MS = 1800;
const useNative = Platform.OS !== 'web';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const anim = useRef(new Animated.Value(0)).current; // 0 — скрыт, 1 — показан
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setMessage(msg);
      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: useNative,
      }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: useNative,
        }).start(({ finished }) => {
          if (finished) setMessage(null);
        });
      }, VISIBLE_MS);
    },
    [anim]
  );

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] });

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message !== null && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            // insets.top + высота шапки навигации (~56), чтобы плашка выезжала
            // ПОД хедером, а не пряталась за ним.
            { top: insets.top + 64, opacity: anim, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 9999,
    alignItems: 'center',
    backgroundColor: Colors.text,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 24,
  },
  text: { color: Colors.white, fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
