import { Recipe, NutritionTotals } from '../models/types';

// Единицы, для которых «на 100 г/мл» считается напрямую по amount.
// Для шт/стакан/ложка/л пересчёт из «на 100 г» неоднозначен → ингредиент
// помечается как «без данных» и даёт флаг approximate.
const MASS_UNITS = ['гр', 'мл'];

// Подсчёт КБЖУ на всё блюдо. Пользователь вводит КБЖУ на 100 г/мл каждого
// ингредиента; здесь умножаем на граммовку и складываем по всему блюду.
export function calcRecipeNutrition(recipe: Recipe): NutritionTotals {
  let kcal = 0, protein = 0, fat = 0, carb = 0;
  let approximate = false;

  for (const ing of recipe.ingredients) {
    const hasData = ing.kcal100 != null;
    const measurable = MASS_UNITS.includes(ing.unit) && ing.amount > 0;
    if (!hasData || !measurable) {
      approximate = true;      // нет данных ИЛИ единицу нельзя привести к граммам
      continue;
    }
    const k = ing.amount / 100; // доля от 100 г/мл
    kcal    += (ing.kcal100    ?? 0) * k;
    protein += (ing.protein100 ?? 0) * k;
    fat     += (ing.fat100     ?? 0) * k;
    carb    += (ing.carb100    ?? 0) * k;
  }

  return {
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carb: Math.round(carb),
    approximate,
  };
}

// Деление итога на число порций.
export function perPortion(total: NutritionTotals, portions = 1): NutritionTotals {
  const p = Math.max(1, portions);
  return {
    kcal: Math.round(total.kcal / p),
    protein: Math.round(total.protein / p),
    fat: Math.round(total.fat / p),
    carb: Math.round(total.carb / p),
    approximate: total.approximate,
  };
}

// Доли БЖУ по вкладу в калории (для полосы): белок 4 ккал/г, жир 9, углевод 4.
export function macroCalorieShares(n: NutritionTotals) {
  const p = n.protein * 4, f = n.fat * 9, c = n.carb * 4;
  const tot = p + f + c || 1;
  return {
    protein: p / tot,
    fat: f / tot,
    carb: c / tot,
  };
}
