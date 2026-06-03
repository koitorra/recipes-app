export type RecipesStackParamList = {
  RecipesList: undefined;
  RecipeDetail: { recipeId: string };
  AddRecipe: { recipeId?: string } | undefined;
};

export type ShoppingStackParamList = {
  ShoppingList: undefined;
};

export type CalendarStackParamList = {
  CalendarMain: undefined;
};

export type MoreStackParamList = {
  MoreMain: undefined;
};

export type BottomTabParamList = {
  RecipesTab: undefined;
  ShoppingTab: undefined;
  CalendarTab: undefined;
  MoreTab: undefined;
};
