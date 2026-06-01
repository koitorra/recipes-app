import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingItem, Ingredient } from '../models/types';
import { generateId } from '../utils/id';

const KEY = '@shopping';

export const getShoppingList = async (): Promise<ShoppingItem[]> => {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
};

export const addShoppingItem = async (item: ShoppingItem): Promise<void> => {
  const list = await getShoppingList();
  list.push(item);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
};

export const addIngredientsFromRecipe = async (
  recipeId: string,
  ingredients: Ingredient[]
): Promise<void> => {
  const list = await getShoppingList();
  const newItems: ShoppingItem[] = ingredients.map(ing => ({
    id: generateId(),
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    bought: false,
    sourceRecipeId: recipeId,
  }));
  await AsyncStorage.setItem(KEY, JSON.stringify([...list, ...newItems]));
};

export const toggleBought = async (itemId: string): Promise<void> => {
  const list = await getShoppingList();
  const item = list.find(i => i.id === itemId);
  if (item) item.bought = !item.bought;
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
};

export const removeShoppingItem = async (itemId: string): Promise<void> => {
  const list = await getShoppingList();
  await AsyncStorage.setItem(KEY, JSON.stringify(list.filter(i => i.id !== itemId)));
};

export const clearBoughtItems = async (): Promise<void> => {
  const list = await getShoppingList();
  await AsyncStorage.setItem(KEY, JSON.stringify(list.filter(i => !i.bought)));
};
