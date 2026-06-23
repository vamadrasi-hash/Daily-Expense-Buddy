import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Gamepad2,
  Heart,
  MoreHorizontal,
} from "lucide-react";

export const CATEGORIES = [
  { value: "food", label: "Food", icon: Utensils, color: "hsl(142, 71%, 45%)" },
  { value: "transport", label: "Transport", icon: Car, color: "hsl(199, 89%, 48%)" },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: "hsl(262, 83%, 58%)" },
  { value: "bills", label: "Bills", icon: Receipt, color: "hsl(25, 95%, 53%)" },
  { value: "entertainment", label: "Entertainment", icon: Gamepad2, color: "hsl(326, 78%, 60%)" },
  { value: "health", label: "Health", icon: Heart, color: "hsl(0, 84%, 60%)" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "hsl(220, 9%, 46%)" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function getCategoryConfig(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[6];
}
