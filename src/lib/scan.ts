export type FoodItem = {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Analysis = {
  isFood: boolean;
  items: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  healthScore: number; // 1-10
  tip: string;
  ingredients: string[];
};

export const EMPTY_ANALYSIS: Analysis = {
  isFood: false,
  items: [],
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  healthScore: 0,
  tip: "",
  ingredients: [],
};
