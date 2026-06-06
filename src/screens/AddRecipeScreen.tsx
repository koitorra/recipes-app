import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform, KeyboardAvoidingView, Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { RecipesStackParamList } from '../navigation/types';
import { Recipe, Ingredient, UNITS } from '../models/types';
import { generateId } from '../utils/id';
import { saveRecipe, getRecipeById } from '../storage/recipeStorage';
import { getAllTags } from '../storage/filterStorage';
import { useSettings } from '../context/SettingsContext';
import { displayUnit, displayTag } from '../utils/units';
import { calcRecipeNutrition, perPortion } from '../utils/nutrition';
import { useTranslation } from '../i18n/useTranslation';
import CollapsibleSection from '../components/CollapsibleSection';
import TagBadge from '../components/TagBadge';

// Разбор числового ввода КБЖУ: запятая → точка, пусто/NaN → undefined.
const parseNutrition = (v: string): number | undefined => {
  const n = parseFloat(v.replace(',', '.'));
  return isNaN(n) ? undefined : n;
};
// Показ хранимого числа КБЖУ в поле (с запятой как десятичным разделителем).
const showNutrition = (n?: number): string =>
  n == null ? '' : String(n).replace('.', ',');

type Props = NativeStackScreenProps<RecipesStackParamList, 'AddRecipe'>;

const emptyIngredient = (): Ingredient => ({
  id: generateId(), name: '', amount: 0, unit: 'гр',
});

// Маленькое поле ввода КБЖУ «на 100 г/мл» под ингредиентом.
// Поле ввода КБЖУ. Держит собственный текстовый стейт, чтобы не терять
// введённую запятую/точку: если синхронизировать value напрямую из числа в
// модели, «23,» тут же превратилось бы в «23» и дробные значения не набрать.
function MiniField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const [text, setText] = useState(value);

  // Подхватываем внешнее значение (загрузка рецепта при редактировании) только
  // когда оно реально отличается по числу от уже набранного — иначе ввод дробей
  // ломался бы на каждом перерендере родителя.
  useEffect(() => {
    const num = (s: string) => {
      const n = parseFloat(s.replace(',', '.'));
      return isNaN(n) ? null : n;
    };
    if (num(text) !== num(value)) setText(value);
  }, [value]);

  const handleChange = (v: string) => {
    setText(v);
    onChange(v);
  };

  return (
    <View style={styles.miniField}>
      <TextInput
        style={styles.miniInput}
        placeholder="0"
        placeholderTextColor={Colors.placeholder}
        value={text}
        onChangeText={handleChange}
        keyboardType="numeric"
        selectTextOnFocus
        maxLength={6}
      />
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

export default function AddRecipeScreen({ navigation, route }: Props) {
  const editId = route.params?.recipeId;
  const isEdit = !!editId;
  const { settings } = useSettings();
  const { t, lang } = useTranslation();

  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [portions, setPortions] = useState(1);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(0);

  useEffect(() => { getAllTags().then(setAvailableTags); }, []);

  // Загрузка рецепта при редактировании
  useEffect(() => {
    if (!editId) return;
    getRecipeById(editId).then(recipe => {
      if (!recipe) return;
      setName(recipe.name);
      setTags(recipe.tags);
      // Совместимость со старыми рецептами без unit
      const fixed = recipe.ingredients.map(ing => ({
        ...ing,
        amount: ing.amount || (ing as any).grams || 0,
        unit: ing.unit || 'гр',
      }));
      setIngredients(fixed.length > 0 ? fixed : [emptyIngredient()]);
      setSteps(recipe.steps.length > 0 ? recipe.steps : ['']);
      setAdditionalInfo(recipe.additionalInfo);
      setVideoLink(recipe.videoLink);
      setPortions(recipe.portions ?? 1);
    });
  }, [editId]);

  // Хедер
  useEffect(() => {
    navigation.setOptions({
      title: isEdit ? t('nav.editRecipe') : t('nav.newRecipe'),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      ),
    });
  }, [name, tags, ingredients, steps, additionalInfo, videoLink, portions, t]);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const updateIngredient = (index: number, patch: Partial<Ingredient>) => {
    setIngredients(prev => prev.map((ing, i) => i === index ? { ...ing, ...patch } : ing));
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    setSteps(prev => prev.map((s, i) => i === index ? value : s));
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('addRecipe.nameRequired'));
      return;
    }
    const recipe: Recipe = {
      id: editId || generateId(),
      name: name.trim(),
      tags,
      ingredients: ingredients.filter(i => i.name.trim()),
      steps: steps.filter(s => s.trim()),
      additionalInfo: additionalInfo.trim(),
      videoLink: videoLink.trim(),
      createdAt: Date.now(),
      portions,
    };
    await saveRecipe(recipe);
    navigation.goBack();
  };

  const content = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Название */}
      <View style={styles.nameContainer}>
        <TextInput
          style={styles.nameInput}
          placeholder={t('addRecipe.namePlaceholder')}
          placeholderTextColor={Colors.placeholder}
          value={name}
          onChangeText={setName}
          maxLength={60}
        />
      </View>

      {/* Теги */}
      <CollapsibleSection title={t('addRecipe.cookMethods')} defaultExpanded>
        <View style={styles.tagsRow}>
          {availableTags.map(tag => (
            <TagBadge
              key={tag} label={displayTag(tag, lang)}
              active={tags.includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </View>
      </CollapsibleSection>

      {/* Ингредиенты */}
      <CollapsibleSection title={t('addRecipe.ingredients')} defaultExpanded>
        {ingredients.map((ing, index) => (
          <View key={ing.id}>
          <View style={styles.ingredientRow}>
            <View style={styles.ingredientFields}>
              <TextInput
                style={styles.ingredientName}
                placeholder={t('addRecipe.product')}
                placeholderTextColor={Colors.placeholder}
                value={ing.name}
                onChangeText={v => updateIngredient(index, { name: v })}
                maxLength={60}
                multiline
                scrollEnabled={false}
              />
              <TextInput
                style={styles.ingredientAmount}
                placeholder="0"
                placeholderTextColor={Colors.placeholder}
                value={ing.amount ? String(ing.amount) : ''}
                onChangeText={v => updateIngredient(index, { amount: parseInt(v) || 0 })}
                keyboardType="numeric"
                selectTextOnFocus
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.unitButton}
                onPress={() => { setActiveIngredientIndex(index); setUnitModalVisible(true); }}
              >
                <Text style={styles.unitButtonText}>{displayUnit(ing.unit, settings.measurement, lang)}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeIngredient(index)}>
              <Ionicons name="close-circle" size={22} color={Colors.danger} />
            </TouchableOpacity>
          </View>
          {settings.calorieCounting && (
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>
                {ing.unit === 'мл' ? t('addRecipe.per100ml') : t('addRecipe.per100g')}
              </Text>
              <View style={styles.miniFields}>
                <MiniField
                  label="ккал"
                  value={showNutrition(ing.kcal100)}
                  onChange={v => updateIngredient(index, { kcal100: parseNutrition(v) })}
                />
                {settings.showMacros && (
                  <>
                    <MiniField
                      label="Б"
                      value={showNutrition(ing.protein100)}
                      onChange={v => updateIngredient(index, { protein100: parseNutrition(v) })}
                    />
                    <MiniField
                      label="Ж"
                      value={showNutrition(ing.fat100)}
                      onChange={v => updateIngredient(index, { fat100: parseNutrition(v) })}
                    />
                    <MiniField
                      label="У"
                      value={showNutrition(ing.carb100)}
                      onChange={v => updateIngredient(index, { carb100: parseNutrition(v) })}
                    />
                  </>
                )}
              </View>
            </View>
          )}
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => setIngredients(prev => [...prev, emptyIngredient()])}>
          <Ionicons name="add-circle-outline" size={20} color={Colors.accentGreen} />
          <Text style={styles.addBtnText}>{t('addRecipe.addIngredient')}</Text>
        </TouchableOpacity>
      </CollapsibleSection>

      {/* Порции + живой итог КБЖУ (только при включённой функции) */}
      {settings.calorieCounting && (() => {
        const recipeForCalc: Recipe = {
          id: '', name: '', tags: [], ingredients,
          steps: [], additionalInfo: '', videoLink: '', createdAt: 0,
        };
        const total = calcRecipeNutrition(recipeForCalc);
        const portion = perPortion(total, portions);
        const prefix = total.approximate ? '≈ ' : '';
        return (
          <View style={styles.totalCard}>
            <View style={styles.portionsRow}>
              <Text style={styles.portionsLabel}>{t('addRecipe.portions')}</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setPortions(p => Math.max(1, p - 1))}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{portions}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setPortions(p => Math.min(99, p + 1))}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('addRecipe.total')}</Text>
              <Text style={styles.totalValue}>{prefix}{total.kcal}</Text>
              <Text style={styles.totalHint}>{t('addRecipe.totalPerDish')}</Text>
            </View>
            <Text style={styles.totalPortion}>
              {prefix}{portion.kcal} {t('addRecipe.totalPerPortion')}
            </Text>
            {settings.showMacros && (
              <Text style={styles.totalMacros}>
                {t('nutrition.protein')[0]} {total.protein} · {t('nutrition.fat')[0]} {total.fat} · {t('nutrition.carb')[0]} {total.carb} {t('nutrition.gram')}
              </Text>
            )}
            <Text style={styles.totalAuto}>{t('addRecipe.autoCalc')}</Text>
          </View>
        );
      })()}

      {/* Шаги */}
      <CollapsibleSection title={t('addRecipe.cookingMethod')} defaultExpanded>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{index + 1}.</Text>
            <TextInput
              style={styles.stepInput}
              placeholder={t('addRecipe.stepDescription')}
              placeholderTextColor={Colors.placeholder}
              value={step}
              onChangeText={v => updateStep(index, v)}
              multiline
              maxLength={300}
            />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeStep(index)}>
              <Ionicons name="close-circle" size={22} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => setSteps(prev => [...prev, ''])}>
          <Ionicons name="add-circle-outline" size={20} color={Colors.accentGreen} />
          <Text style={styles.addBtnText}>{t('addRecipe.addStep')}</Text>
        </TouchableOpacity>
      </CollapsibleSection>

      {/* Доп. информация */}
      <CollapsibleSection title={t('addRecipe.additionalInfo')} defaultExpanded>
        <TextInput
          style={styles.multilineInput}
          placeholder={t('addRecipe.additionalInfoPlaceholder')}
          placeholderTextColor={Colors.placeholder}
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </CollapsibleSection>

      {/* Видео */}
      <CollapsibleSection title={t('addRecipe.videoLink')} defaultExpanded>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor={Colors.placeholder}
          value={videoLink}
          onChangeText={setVideoLink}
          keyboardType="url"
          autoCapitalize="none"
        />
      </CollapsibleSection>
    </ScrollView>
  );

  return (
    <View style={styles.flex}>
      {Platform.OS === 'ios'
        ? <KeyboardAvoidingView style={styles.flex} behavior="padding">{content}</KeyboardAvoidingView>
        : content
      }
      {/* Модалка единиц */}
      <Modal visible={unitModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setUnitModalVisible(false)}>
          <View style={styles.unitModal}>
            <Text style={styles.unitModalTitle}>{t('addRecipe.unitModalTitle')}</Text>
            {UNITS.map(unit => (
              <TouchableOpacity
                key={unit}
                style={styles.unitOption}
                onPress={() => { updateIngredient(activeIngredientIndex, { unit }); setUnitModalVisible(false); }}
              >
                <Text style={styles.unitOptionText}>{displayUnit(unit, settings.measurement, lang)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: 16, paddingBottom: 40 },
  saveBtn: {
    backgroundColor: Colors.accentGreen,
    borderRadius: 999,
    paddingVertical: 7, paddingHorizontal: 16,
    marginRight: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  nameContainer: { backgroundColor: Colors.white, borderRadius: 12, marginBottom: 10, padding: 14 },
  nameInput: { fontSize: 16, color: Colors.text },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  ingredientRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  ingredientFields: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.cardLight, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8, marginRight: 10,
  },
  ingredientName: {
    flex: 1, flexShrink: 1, fontSize: 14, color: Colors.text,
    maxHeight: 60, paddingTop: 0, paddingBottom: 0,
  },
  ingredientAmount: {
    width: 50, flexShrink: 0, fontSize: 14, color: Colors.text, textAlign: 'right',
  },
  unitButton: {
    paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4, flexShrink: 0,
    backgroundColor: Colors.background, borderRadius: 6,
  },
  unitButtonText: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  removeBtn: { padding: 4 },
  nutritionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: -2 },
  nutritionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.accentGreen,
    width: 52, lineHeight: 13,
  },
  miniFields: { flex: 1, flexDirection: 'row', gap: 6, marginRight: 32 },
  miniField: { flex: 1 },
  miniInput: {
    backgroundColor: Colors.cardLight, borderRadius: 8,
    paddingVertical: 7, paddingHorizontal: 4,
    fontSize: 14, fontWeight: '700', color: Colors.text, textAlign: 'center',
  },
  miniLabel: {
    fontSize: 10.5, fontWeight: '700', color: Colors.placeholder,
    textAlign: 'center', marginTop: 3,
  },
  totalCard: {
    backgroundColor: Colors.white, borderRadius: 12,
    padding: 14, marginBottom: 10,
  },
  portionsRow: { flexDirection: 'row', alignItems: 'center' },
  portionsLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', gap: 10 },
  stepperBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.cardLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 18, fontWeight: '800', color: Colors.text },
  stepperValue: { fontSize: 17, fontWeight: '900', color: Colors.text, width: 22, textAlign: 'center' },
  totalDivider: { height: 1, backgroundColor: Colors.lightBorder, opacity: 0.4, marginVertical: 13 },
  totalRow: { flexDirection: 'row', alignItems: 'baseline' },
  totalLabel: { fontSize: 13, fontWeight: '700', color: Colors.placeholder, marginRight: 7 },
  totalValue: { fontSize: 22, fontWeight: '900', color: Colors.text, marginRight: 7 },
  totalHint: { fontSize: 13, fontWeight: '700', color: Colors.placeholder },
  totalPortion: { fontSize: 13.5, fontWeight: '800', color: Colors.accentGreen, marginTop: 4 },
  totalMacros: { fontSize: 12.5, fontWeight: '700', color: Colors.placeholder, marginTop: 6 },
  totalAuto: { fontSize: 11.5, color: Colors.placeholder, marginTop: 6, fontStyle: 'italic' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  stepNumber: { fontSize: 14, fontWeight: '600', color: Colors.text, marginRight: 8, marginTop: 10 },
  stepInput: {
    flex: 1, fontSize: 14, color: Colors.text,
    backgroundColor: Colors.cardLight, borderRadius: 8,
    padding: 10, marginRight: 10, minHeight: 40,
  },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingTop: 4 },
  addBtnText: { fontSize: 14, color: Colors.accentGreen, marginLeft: 6 },
  multilineInput: {
    fontSize: 14, color: Colors.text,
    backgroundColor: Colors.cardLight, borderRadius: 8,
    padding: 10, minHeight: 80, textAlignVertical: 'top',
  },
  input: {
    fontSize: 14, color: Colors.text,
    backgroundColor: Colors.cardLight, borderRadius: 8, padding: 10,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  unitModal: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, width: 200 },
  unitModalTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 12, textAlign: 'center' },
  unitOption: {
    paddingVertical: 10, paddingHorizontal: 12,
    borderBottomWidth: 0.5, borderBottomColor: Colors.lightBorder,
  },
  unitOptionText: { fontSize: 15, color: Colors.text, textAlign: 'center' },
});
