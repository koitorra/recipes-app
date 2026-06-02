import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { RecipesStackParamList } from '../navigation/types';
import { Recipe } from '../models/types';
import { getAllRecipes, deleteRecipe, removeTagFromAllRecipes } from '../storage/recipeStorage';
import { getAllTags, addTag, removeTag } from '../storage/filterStorage';
import { animateLayout } from '../utils/layout';
import RecipeCard from '../components/RecipeCard';
import CollapsibleSection from '../components/CollapsibleSection';
import TagBadge from '../components/TagBadge';
import { confirmDestructive } from '../utils/confirm';

type Props = NativeStackScreenProps<RecipesStackParamList, 'RecipesList'>;

export default function RecipesListScreen({ navigation }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [excludedTags, setExcludedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useFocusEffect(
    useCallback(() => {
      getAllRecipes().then(setRecipes);
      getAllTags().then(setAllTags);
    }, [])
  );

  // Цикл состояний: нет → включить → исключить → нет
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
      setExcludedTags(prev => [...prev, tag]);
    } else if (excludedTags.includes(tag)) {
      setExcludedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const tagState = (tag: string): 'none' | 'include' | 'exclude' =>
    selectedTags.includes(tag) ? 'include'
      : excludedTags.includes(tag) ? 'exclude'
      : 'none';

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = !searchQuery.trim() ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => r.tags.includes(tag));
    const matchesExcluded = excludedTags.every(tag => !r.tags.includes(tag));
    return matchesSearch && matchesTags && matchesExcluded;
  });

  const handleDelete = (recipe: Recipe) => {
    confirmDestructive(
      'Удалить рецепт',
      `Удалить "${recipe.name}"?`,
      'Удалить',
      async () => {
        await deleteRecipe(recipe.id);
        animateLayout();
        setRecipes(await getAllRecipes());
      }
    );
  };

  const handleAddTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    if (allTags.includes(trimmed)) {
      Alert.alert('Ошибка', 'Такой фильтр уже есть');
      return;
    }
    await addTag(trimmed);
    setNewTagName('');
    setAllTags(await getAllTags());
  };

  const handleRemoveTag = (tag: string) => {
    confirmDestructive(
      'Удалить фильтр',
      `Удалить фильтр "${tag}"? Он будет убран со всех рецептов.`,
      'Удалить',
      async () => {
        await removeTag(tag);
        await removeTagFromAllRecipes(tag);
        setSelectedTags(prev => prev.filter(t => t !== tag));
        setExcludedTags(prev => prev.filter(t => t !== tag));
        setAllTags(await getAllTags());
        setRecipes(await getAllRecipes());
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Кнопки +/- */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, styles.deleteBtnStyle, deleteMode && styles.deleteBtnActive]}
          onPress={() => { animateLayout(); setDeleteMode(!deleteMode); }}
        >
          <Ionicons name="remove" size={20} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.addBtnStyle]}
          onPress={() => navigation.navigate('AddRecipe')}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Поиск */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.placeholder} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск рецепта..."
          placeholderTextColor={Colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Фильтры */}
      <View style={styles.filterContainer}>
        <CollapsibleSection title="Фильтры">
          <View style={styles.tagsRow}>
            {allTags.map(tag => (
              <TagBadge
                key={tag}
                label={tag}
                state={tagState(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
            <TouchableOpacity
              style={styles.editTagsBtn}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="pencil" size={16} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </CollapsibleSection>
      </View>

      {/* Список рецептов */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            deleteMode={deleteMode}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedTags.length > 0 || excludedTags.length > 0
                ? 'Ничего не найдено'
                : 'Нет рецептов. Нажмите +, чтобы добавить!'}
            </Text>
          </View>
        }
      />

      {/* Модалка редактирования фильтров */}
      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Редактировать фильтры</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={allTags}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <View style={styles.tagRow}>
                  <Text style={styles.tagRowText}>{item}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(item)}>
                    <Ionicons name="close-circle" size={22} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              )}
            />

            <View style={styles.addTagRow}>
              <TextInput
                style={styles.addTagInput}
                placeholder="Новый фильтр..."
                placeholderTextColor={Colors.placeholder}
                value={newTagName}
                onChangeText={setNewTagName}
                onSubmitEditing={handleAddTag}
                maxLength={30}
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
                <Ionicons name="add" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  controlBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  addBtnStyle: { backgroundColor: Colors.accentGreen },
  deleteBtnStyle: { backgroundColor: Colors.danger, opacity: 0.6 },
  deleteBtnActive: { opacity: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text, marginLeft: 8 },
  filterContainer: { paddingHorizontal: 16, paddingTop: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  editTagsBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.text,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  list: { padding: 16 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 15, color: Colors.text, opacity: 0.5, textAlign: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  tagRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 10, padding: 12, marginBottom: 8,
  },
  tagRowText: { fontSize: 15, color: Colors.text },
  addTagRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  addTagInput: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.text,
  },
  addTagBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: Colors.accentGreen,
    justifyContent: 'center', alignItems: 'center',
  },
});
