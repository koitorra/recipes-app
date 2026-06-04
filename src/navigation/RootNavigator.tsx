import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useTranslation } from '../i18n/useTranslation';
import type { RecipesStackParamList, ShoppingStackParamList, CalendarStackParamList, MoreStackParamList, BottomTabParamList } from './types';

import RecipesListScreen from '../screens/RecipesListScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MoreScreen from '../screens/MoreScreen';
import SettingsScreen from '../screens/SettingsScreen';

const RecipesStack = createNativeStackNavigator<RecipesStackParamList>();
const ShoppingStack = createNativeStackNavigator<ShoppingStackParamList>();
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function RecipesStackNavigator() {
  const { t } = useTranslation();
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
        options={{ title: t('nav.recipes') }}
      />
      <RecipesStack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: t('nav.recipe') }}
      />
      <RecipesStack.Screen
        name="AddRecipe"
        component={AddRecipeScreen}
        options={{ title: t('nav.newRecipe') }}
      />
    </RecipesStack.Navigator>
  );
}

function ShoppingStackNavigator() {
  const { t } = useTranslation();
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
        options={{ title: t('nav.shoppingList') }}
      />
    </ShoppingStack.Navigator>
  );
}

function CalendarStackNavigator() {
  const { t } = useTranslation();
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
        options={{ title: t('nav.calendar') }}
      />
    </CalendarStack.Navigator>
  );
}

function MoreStackNavigator() {
  const { t } = useTranslation();
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <MoreStack.Screen
        name="MoreMain"
        component={MoreScreen}
        options={{ title: t('nav.more') }}
      />
      <MoreStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('nav.settings') }}
      />
    </MoreStack.Navigator>
  );
}

export default function RootNavigator() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
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
          tabBarLabel: t('nav.tabRecipes'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ShoppingTab"
        component={ShoppingStackNavigator}
        options={{
          tabBarLabel: t('nav.tabShopping'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStackNavigator}
        options={{
          tabBarLabel: t('nav.tabCalendar'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{
          tabBarLabel: t('nav.tabMore'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
