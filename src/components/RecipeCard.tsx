import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Recipe } from '../models/types';

interface Props {
  recipe: Recipe;
  onPress: () => void;
  deleteMode: boolean;
  onDelete: () => void;
}

export default function RecipeCard({ recipe, onPress, deleteMode, onDelete }: Props) {
  const ingredientPreview = recipe.ingredients
    .slice(0, 3)
    .map((i) => i.name)
    .join(', ');

  return (
    <View style={styles.row}>
      {deleteMode && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
          <Ionicons name="remove-circle" size={24} color={Colors.danger} />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.name}>{recipe.name}</Text>
        {ingredientPreview.length > 0 && (
          <Text style={styles.preview} numberOfLines={1}>
            {ingredientPreview}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteBtn: {
    marginRight: 8,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  preview: {
    fontSize: 13,
    color: Colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
});
