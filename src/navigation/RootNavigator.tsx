import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import type { RecipesStackParamList, ShoppingStackParamList, CalendarStackParamList, BottomTabParamList } from './types';

import RecipesListScreen from '../screens/RecipesListScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import CalendarScreen from '../screens/CalendarScreen';

const RecipesStack = createNativeStackNavigator<RecipesStackParamList>();
const ShoppingStack = createNativeStackNavigator<ShoppingStackParamList>();
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function RecipesStackNavigator() {
  return (
    <RecipesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <RecipesStack.Screen
        name="RecipesList"
        component={RecipesListScreen}
        options={{ title: 'Рецепты' }}
      />
      <RecipesStack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: 'Рецепт' }}
      />
      <RecipesStack.Screen
        name="AddRecipe"
        component={AddRecipeScreen}
        options={{ title: 'Новый рецепт' }}
      />
    </RecipesStack.Navigator>
  );
}

function ShoppingStackNavigator() {
  return (
    <ShoppingStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <ShoppingStack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{ title: 'Список покупок' }}
      />
    </ShoppingStack.Navigator>
  );
}

function CalendarStackNavigator() {
  return (
    <CalendarStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <CalendarStack.Screen
        name="CalendarMain"
        component={CalendarScreen}
        options={{ title: 'Календарь' }}
      />
    </CalendarStack.Navigator>
  );
}

export default function RootNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: Colors.cardBackground,
          borderTopColor: Colors.lightBorder,
          height: 76 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 14),
          paddingTop: 8,
        },
        tabBarIconStyle: { marginBottom: 0 },
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, marginBottom: 4, overflow: 'visible' },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.text,
      }}
    >
      <Tab.Screen
        name="RecipesTab"
        component={RecipesStackNavigator}
        options={{
          tabBarLabel: 'Рецепты',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ShoppingTab"
        component={ShoppingStackNavigator}
        options={{
          tabBarLabel: 'Покупки',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStackNavigator}
        options={{
          tabBarLabel: 'Календарь',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
