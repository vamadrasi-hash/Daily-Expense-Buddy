import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Budgets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { categories } = useCategories();
  const { currencySymbol } = useCurrency();

  const { data: budgets = [] } = useQuery({
    queryKey: ["dashboard", "budgets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("budgets").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [values, setValues] = useState<Record<string, string>>({});

  const upsertMutation = useMutation({
    mutationFn: async ({ category, amount }: { category: string; amount: number }) => {
      if (!user) throw new Error("Not authenticated");
      const existing = budgets.find((b) => b.category === category);
      if (existing) {
        const { error } = await supabase.from("budgets").update({ monthly_limit: amount }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("budgets").insert({ category, monthly_limit: amount, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "budgets"] });
      toast.success("Budget saved!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6 md:pt-14">
      <h1 className="text-2xl font-extrabold">Budget Settings</h1>
      <p className="text-muted-foreground text-sm">Set monthly spending limits per category.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map((cat) => {
          const existing = budgets.find((b) => b.category === cat.value);
          const val = values[cat.value] ?? existing?.monthly_limit?.toString() ?? "";
          const CatIcon = cat.icon;
          return (
            <Card key={cat.value} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + "22", color: cat.color }}>
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <span className="font-bold">{cat.label}</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-muted-foreground font-medium">{currencySymbol}</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={val}
                      onChange={(e) => setValues((v) => ({ ...v, [cat.value]: e.target.value }))}
                      className="pl-8"
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={!val || parseFloat(val) <= 0}
                    onClick={() => upsertMutation.mutate({ category: cat.value, amount: parseFloat(val) })}
                  >
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
