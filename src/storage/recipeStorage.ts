import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../models/types';

const KEY = '@recipes';

export const getAllRecipes = async (): Promise<Recipe[]> => {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
};

export const getRecipeById = async (id: string): Promise<Recipe | undefined> => {
  const recipes = await getAllRecipes();
  return recipes.find(r => r.id === id);
};

export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  const recipes = await getAllRecipes();
  const index = recipes.findIndex(r => r.id === recipe.id);
  if (index >= 0) {
    recipes[index] = recipe;
  } else {
    recipes.push(recipe);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(recipes));
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const recipes = await getAllRecipes();
  await AsyncStorage.setItem(KEY, JSON.stringify(recipes.filter(r => r.id !== id)));
};
