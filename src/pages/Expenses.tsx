import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useCategories, getCategoryFromList } from "@/hooks/useCategories";
import { useCurrency, formatCurrency } from "@/hooks/useCurrency";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, Search, Plus } from "lucide-react";
import InlineCategoryAdd from "@/components/InlineCategoryAdd";
import { toast } from "sonner";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import type { Tables } from "@/integrations/supabase/types";

type Expense = Tables<"expenses">;

export default function Expenses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { categories } = useCategories();
  const { currencySymbol } = useCurrency();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Expense deleted");
    },
  });

  const filtered = expenses.filter((e) => {
    const matchesSearch = !search || (e.notes?.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = filterCategory === "all" || e.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const grouped = filtered.reduce<Record<string, Expense[]>>((acc, e) => {
    const key = format(new Date(e.date), "MMMM yyyy");
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const fmt = (n: number) => formatCurrency(n, currencySymbol);

  return (
    <div className="space-y-4 md:pt-14">
      <h1 className="text-2xl font-extrabold">All Expenses</h1>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Loading...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No expenses found.</p>
      ) : (
        Object.entries(grouped).map(([month, items]) => {
          const monthTotal = items.reduce((s, e) => s + Number(e.amount), 0);
          return (
            <div key={month} className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <h2 className="font-bold text-sm text-muted-foreground uppercase">{month}</h2>
                <span className="text-sm font-bold">{fmt(monthTotal)}</span>
              </div>
              <Card className="border-0 shadow-md">
                <CardContent className="p-2 divide-y">
                  {items.map((expense) => {
                    const cat = getCategoryFromList(categories, expense.category);
                    const CatIcon = cat.icon;
                    return (
                      <div key={expense.id} className="flex items-center gap-3 p-2.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + "22", color: cat.color }}>
                          <CatIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{expense.notes || cat.label}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(expense.date), "MMM d, yyyy")}</p>
                        </div>
                        <p className="font-bold text-sm mr-2">-{fmt(Number(expense.amount))}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditExpense(expense)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(expense.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          );
        })
      )}

      {editExpense && (
        <AddExpenseDialog open={!!editExpense} onOpenChange={(open) => !open && setEditExpense(null)} expense={editExpense} />
      )}
    </div>
  );
}
