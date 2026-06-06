import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Recipe, NutritionTotals } from '../models/types';
import { calcRecipeNutrition, perPortion, macroCalorieShares } from '../utils/nutrition';
import { useTranslation } from '../i18n/useTranslation';
import CollapsibleSection from './CollapsibleSection';

interface Props {
  recipe: Recipe;
  showMacros: boolean;
}

type Mode = 'portion' | 'dish';

// Секция «Пищевая ценность» (вариант B — полоса БЖУ). Рендерится в детальном
// просмотре рецепта только при включённой функции подсчёта калорий.
export default function NutritionSection({ recipe, showMacros }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('portion');

  const total = calcRecipeNutrition(recipe);
  const data: NutritionTotals =
    mode === 'portion' ? perPortion(total, recipe.portions ?? 1) : total;

  const hint = mode === 'portion' ? t('nutrition.kcalPerPortion') : t('nutrition.kcalPerDish');
  const prefix = data.approximate ? '≈ ' : '';

  const shares = macroCalorieShares(data);
  const macros = [
    { key: 'protein' as const, label: t('nutrition.protein'), color: Colors.protein },
    { key: 'fat' as const, label: t('nutrition.fat'), color: Colors.fat },
    { key: 'carb' as const, label: t('nutrition.carb'), color: Colors.carb },
  ];

  return (
    <CollapsibleSection title={t('nutrition.title')}>
      {/* Сегмент-переключатель «На порцию / На блюдо» */}
      <View style={styles.segment}>
        {(['portion', 'dish'] as Mode[]).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.segmentItem, mode === m && styles.segmentItemActive]}
            onPress={() => setMode(m)}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, mode === m && styles.segmentTextActive]}>
              {m === 'portion' ? t('nutrition.perPortion') : t('nutrition.perDish')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Крупное число ккал + мягкая подпись */}
      <View style={styles.kcalRow}>
        <Text style={styles.kcalValue}>{prefix}{data.kcal}</Text>
        <Text style={styles.kcalHint}>{hint}</Text>
      </View>

      {showMacros && (
        <>
          {/* Полоса БЖУ — доли по вкладу в калории */}
          <View style={styles.bar}>
            {macros.map(m => (
              <View
                key={m.key}
                style={{ flex: shares[m.key] || 0.0001, backgroundColor: m.color }}
              />
            ))}
          </View>

          {/* Легенда */}
          <View style={styles.legend}>
            {macros.map(m => (
              <View key={m.key} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: m.color }]} />
                <Text style={styles.legendLabel}>{m.label}</Text>
                <Text style={styles.legendValue}>{data[m.key]} {t('nutrition.gram')}</Text>
                <Text style={styles.legendPercent}>{Math.round(shares[m.key] * 100)}%</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Сноска «приблизительно» */}
      {data.approximate && (
        <Text style={styles.approxNote}>{t('nutrition.approximateNote')}</Text>
      )}
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 9,
    padding: 3,
    marginBottom: 14,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 7,
    alignItems: 'center',
  },
  segmentItemActive: { backgroundColor: Colors.white },
  segmentText: { fontSize: 14, fontWeight: '700', color: Colors.placeholder },
  segmentTextActive: { color: Colors.text },
  kcalRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
  kcalValue: { fontSize: 36, fontWeight: '900', color: Colors.text, lineHeight: 38 },
  kcalHint: { fontSize: 15, fontWeight: '700', color: Colors.placeholder, marginLeft: 8 },
  bar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    gap: 2,
  },
  legend: { marginTop: 14, gap: 9 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 3, marginRight: 9 },
  legendLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  legendValue: { marginLeft: 'auto', fontSize: 14, fontWeight: '800', color: Colors.text },
  legendPercent: {
    fontSize: 13, fontWeight: '700', color: Colors.placeholder,
    width: 42, textAlign: 'right',
  },
  approxNote: {
    fontSize: 13, color: Colors.placeholder, lineHeight: 18, marginTop: 12,
  },
});
