import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { RecipesStackParamList } from '../navigation/types';
import { Recipe, Ingredient } from '../models/types';
import { getRecipeById } from '../storage/recipeStorage';
import { addIngredientsFromRecipe } from '../storage/shoppingStorage';
import CollapsibleSection from '../components/CollapsibleSection';

type Props = NativeStackScreenProps<RecipesStackParamList, 'RecipeDetail'>;

const formatUnit = (ing: Ingredient) =>
  `${ing.amount} ${ing.unit || 'гр'}`;

export default function RecipeDetailScreen({ navigation, route }: Props) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useFocusEffect(
    useCallback(() => {
      getRecipeById(recipeId).then(r => r && setRecipe(r));
    }, [recipeId])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddRecipe', { recipeId })}
        >
          <Ionicons name="create-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, recipeId]);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  const openVideo = () => {
    Linking.openURL(recipe.videoLink).catch(() =>
      Alert.alert('Ошибка', 'Не удалось открыть ссылку')
    );
  };

  const handleAddToShopping = async () => {
    await addIngredientsFromRecipe(recipe.id, recipe.ingredients);
    Alert.alert('Готово', 'Ингредиенты добавлены в список покупок');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{recipe.name}</Text>

      {recipe.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {recipe.tags.map(tag => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <CollapsibleSection title="Ингредиенты" defaultExpanded>
        {recipe.ingredients.map(ing => (
          <View key={ing.id} style={styles.ingredientRow}>
            <Text style={styles.ingredientName} numberOfLines={3}>{ing.name}</Text>
            <Text style={styles.ingredientAmount}>{formatUnit(ing)}</Text>
          </View>
        ))}
      </CollapsibleSection>

      {recipe.additionalInfo.length > 0 && (
        <CollapsibleSection title="Доп. инфа">
          <Text style={styles.infoText}>{recipe.additionalInfo}</Text>
        </CollapsibleSection>
      )}

      {recipe.steps.length > 0 && (
        <CollapsibleSection title="Приготовление">
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </CollapsibleSection>
      )}

      {recipe.videoLink.length > 0 && (
        <CollapsibleSection title="Видео">
          <TouchableOpacity onPress={openVideo}>
            <Text style={styles.videoLink} numberOfLines={2}>{recipe.videoLink}</Text>
          </TouchableOpacity>
        </CollapsibleSection>
      )}

      {recipe.ingredients.length > 0 && (
        <TouchableOpacity style={styles.shoppingBtn} onPress={handleAddToShopping}>
          <Ionicons name="cart-outline" size={20} color={Colors.white} />
          <Text style={styles.shoppingBtnText}>В список покупок</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  loadingText: { color: Colors.text, fontSize: 16, textAlign: 'center', marginTop: 40 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  tagChip: {
    backgroundColor: Colors.accentGreen,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, marginRight: 6, marginBottom: 6,
  },
  tagText: { color: Colors.white, fontSize: 12 },
  editBtn: { paddingLeft: 12, paddingVertical: 4 },
  ingredientRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: Colors.lightBorder,
  },
  ingredientName: { fontSize: 15, color: Colors.text, flex: 1, flexShrink: 1, marginRight: 10 },
  ingredientAmount: { fontSize: 15, color: Colors.text, fontWeight: '600', flexShrink: 0 },
  infoText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.accentGreen,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10, marginTop: 2,
  },
  stepNumber: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
  videoLink: { fontSize: 14, color: Colors.accent, textDecorationLine: 'underline' },
  shoppingBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.accentGreen, borderRadius: 12, padding: 14, marginTop: 16, gap: 8,
  },
  shoppingBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
