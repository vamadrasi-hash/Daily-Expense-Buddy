import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, isToday } from "date-fns";
import { useCategories, getCategoryFromList } from "@/hooks/useCategories";
import { useCurrency, formatCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, TrendingDown, Wallet, CalendarDays, Download } from "lucide-react";
import AddExpenseDialog from "@/components/AddExpenseDialog";

export default function Dashboard() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const { currencySymbol } = useCurrency();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
  const todayStr = format(now, "yyyy-MM-dd");

  const { data: expenses = [] } = useQuery({
    queryKey: ["dashboard", "expenses", monthStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", monthStart)
        .lte("date", monthEnd)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["dashboard", "budgets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("budgets").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const todayTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0);

  const categorySpending = categories.map((cat) => {
    const spent = expenses
      .filter((e) => e.category === cat.value)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const budget = budgets.find((b) => b.category === cat.value);
    return { ...cat, spent, limit: budget ? Number(budget.monthly_limit) : 0 };
  }).filter((c) => c.spent > 0 || c.limit > 0);

  const recentExpenses = expenses.slice(0, 5);
  const fmt = (n: number) => formatCurrency(n, currencySymbol);

  return (
    <div className="space-y-6 md:pt-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{format(now, "EEEE, MMMM d")}</p>
        </div>
        <Button onClick={() => setShowAddExpense(true)} className="gap-2 font-bold rounded-full shadow-lg">
          <Plus className="h-5 w-5" /> Add
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Today</span>
            </div>
            <p className="text-2xl font-extrabold">{fmt(todayTotal)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-secondary mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">This Month</span>
            </div>
            <p className="text-2xl font-extrabold">{fmt(monthTotal)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-success mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Budget</span>
            </div>
            <p className="text-2xl font-extrabold">{fmt(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Remaining</span>
            </div>
            <p className="text-2xl font-extrabold">
              {totalBudget > 0 ? fmt(totalBudget - monthTotal) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {categorySpending.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categorySpending.map((cat) => {
              const pct = cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0;
              const over = cat.limit > 0 && cat.spent > cat.limit;
              return (
                <div key={cat.value} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.label}
                    </span>
                    <span className={over ? "text-destructive font-bold" : "text-muted-foreground"}>
                      {fmt(cat.spent)} {cat.limit > 0 && `/ ${fmt(cat.limit)}`}
                    </span>
                  </div>
                  {cat.limit > 0 && <Progress value={pct} className="h-2" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No expenses yet. Tap "Add" to get started!
            </p>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((expense) => {
                const cat = getCategoryFromList(categories, expense.category);
                const CatIcon = cat.icon;
                return (
                  <div key={expense.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + "22", color: cat.color }}>
                      <CatIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{expense.notes || cat.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {isToday(new Date(expense.date)) ? "Today" : format(new Date(expense.date), "MMM d")}
                      </p>
                    </div>
                    <p className="font-bold text-sm">-{fmt(Number(expense.amount))}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddExpenseDialog open={showAddExpense} onOpenChange={setShowAddExpense} />

      <div className="mt-2">
        <Link to="/install">
          <Button variant="outline" className="w-full h-11 font-bold gap-2">
            <Download className="h-4 w-4" /> Install SpendWise App
          </Button>
        </Link>
      </div>

      <Button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-20 right-4 md:hidden w-14 h-14 rounded-full shadow-xl text-lg z-50"
        size="icon"
      >
        <Plus className="h-7 w-7" />
      </Button>
    </div>
  );
}
