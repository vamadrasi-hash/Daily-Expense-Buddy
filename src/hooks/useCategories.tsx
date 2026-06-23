import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES } from "@/lib/categories";
import {
  Utensils, Car, ShoppingBag, Receipt, Gamepad2, Heart, MoreHorizontal, Tag,
  Home, Plane, BookOpen, Baby, Dumbbell, Wifi, Coffee, Gift, Briefcase, Music,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils, Car, ShoppingBag, Receipt, Gamepad2, Heart, MoreHorizontal, Tag,
  Home, Plane, BookOpen, Baby, Dumbbell, Wifi, Coffee, Gift, Briefcase, Music,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export function getIconComponent(name: string): LucideIcon {
  return ICON_MAP[name] || Tag;
}

export interface CategoryItem {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  isCustom?: boolean;
  id?: string;
}

export function useCategories(): { categories: CategoryItem[]; isLoading: boolean } {
  const { user } = useAuth();

  const { data: customCategories = [], isLoading } = useQuery({
    queryKey: ["user_categories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_categories")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const defaults: CategoryItem[] = CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
    icon: c.icon,
    color: c.color,
  }));

  const custom: CategoryItem[] = customCategories.map((c) => ({
    value: c.id,
    label: c.name,
    icon: getIconComponent(c.icon),
    color: c.color,
    isCustom: true,
    id: c.id,
  }));

  return { categories: [...defaults, ...custom], isLoading };
}

export function getCategoryFromList(categories: CategoryItem[], value: string): CategoryItem {
  return categories.find((c) => c.value === value) ?? {
    value: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "hsl(220, 9%, 46%)",
  };
}
