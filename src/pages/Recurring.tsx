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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import InlineCategoryAdd from "@/components/InlineCategoryAdd";

export default function Recurring() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { categories } = useCategories();
  const { currencySymbol } = useCurrency();
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("bills");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDate, setNextDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["recurring"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring_expenses")
        .select("*")
        .order("next_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("recurring_expenses").insert({
        amount: parseFloat(amount),
        category,
        frequency,
        next_date: format(nextDate, "yyyy-MM-dd"),
        notes: notes || null,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      toast.success("Recurring expense added!");
      setShowAdd(false);
      setAmount("");
      setNotes("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("recurring_expenses").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recurring_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      toast.success("Deleted");
    },
  });

  const fmt = (n: number) => formatCurrency(n, currencySymbol);

  return (
    <div className="space-y-6 md:pt-14">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Recurring Expenses</h1>
        <Button onClick={() => setShowAdd(true)} className="gap-2 font-bold">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No recurring expenses. Add subscriptions, rent, etc.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const cat = getCategoryFromList(categories, item.category);
            const CatIcon = cat.icon;
            return (
              <Card key={item.id} className="border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + "22", color: cat.color }}>
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.notes || cat.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.frequency} · Next: {format(new Date(item.next_date), "MMM d")}</p>
                  </div>
                  <p className="font-bold text-sm mr-2">{fmt(Number(item.amount))}</p>
                  <Switch checked={item.is_active} onCheckedChange={(checked) => toggleMutation.mutate({ id: item.id, active: checked })} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Add Recurring Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (!amount || parseFloat(amount) <= 0) return; addMutation.mutate(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-2xl font-bold text-center" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                    <InlineCategoryAdd onAdded={(val) => setCategory(val)} />
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Next Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-11 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(nextDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={nextDate} onSelect={(d) => d && setNextDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Netflix, Rent, etc." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <Button type="submit" className="w-full h-11 font-bold" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Saving..." : "Add Recurring Expense"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
