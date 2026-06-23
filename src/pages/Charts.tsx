import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

export default function Charts() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const { currencySymbol } = useCurrency();
  const now = new Date();

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const threeMonthsAgo = format(startOfMonth(subMonths(now, 2)), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", threeMonthsAgo)
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const currentMonthExpenses = expenses.filter(
    (e) => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd
  );

  const pieData = categories.map((cat) => ({
    name: cat.label,
    value: currentMonthExpenses
      .filter((e) => e.category === cat.value)
      .reduce((s, e) => s + Number(e.amount), 0),
    color: cat.color,
  })).filter((d) => d.value > 0);

  const days = eachDayOfInterval({ start: monthStart, end: now });
  const barData = days.map((day) => ({
    date: format(day, "d"),
    amount: currentMonthExpenses
      .filter((e) => e.date === format(day, "yyyy-MM-dd"))
      .reduce((s, e) => s + Number(e.amount), 0),
  }));

  const months = [subMonths(now, 2), subMonths(now, 1), now];
  const lineData = months.map((m) => {
    const mStart = startOfMonth(m);
    const mEnd = endOfMonth(m);
    const total = expenses
      .filter((e) => new Date(e.date) >= mStart && new Date(e.date) <= mEnd)
      .reduce((s, e) => s + Number(e.amount), 0);
    return { month: format(m, "MMM"), total };
  });

  const fmt = (v: number) => `${currencySymbol}${v.toFixed(2)}`;

  return (
    <div className="space-y-6 md:pt-14">
      <h1 className="text-2xl font-extrabold">Reports</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data this month</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Daily Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Bar dataKey="amount" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="total" stroke="hsl(199, 89%, 48%)" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
