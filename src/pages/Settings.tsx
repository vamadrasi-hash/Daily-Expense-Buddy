import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency, CURRENCIES, formatCurrency } from "@/hooks/useCurrency";
import { useCategories, AVAILABLE_ICONS, getIconComponent, type CategoryItem } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const PRESET_COLORS = [
  "hsl(142, 71%, 45%)", "hsl(199, 89%, 48%)", "hsl(262, 83%, 58%)",
  "hsl(25, 95%, 53%)", "hsl(326, 78%, 60%)", "hsl(0, 84%, 60%)",
  "hsl(45, 93%, 47%)", "hsl(172, 66%, 50%)", "hsl(291, 64%, 42%)",
];

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { currencyCode, updateCurrency, isUpdating } = useCurrency();
  const { categories } = useCategories();
  const customCategories = categories.filter((c) => c.isCustom);

  const [showAddCat, setShowAddCat] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("Tag");
  const [catColor, setCatColor] = useState(PRESET_COLORS[0]);

  const openEditDialog = (cat: CategoryItem) => {
    setEditingCat(cat);
    setCatName(cat.label);
    setCatIcon(AVAILABLE_ICONS.find((name) => getIconComponent(name) === cat.icon) || "Tag");
    setCatColor(cat.color);
    setShowAddCat(true);
  };

  const openAddDialog = () => {
    setEditingCat(null);
    setCatName("");
    setCatIcon("Tag");
    setCatColor(PRESET_COLORS[0]);
    setShowAddCat(true);
  };

  const addCatMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (editingCat?.id) {
        const { error } = await supabase.from("user_categories").update({
          name: catName,
          icon: catIcon,
          color: catColor,
        }).eq("id", editingCat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_categories").insert({
          user_id: user.id,
          name: catName,
          icon: catIcon,
          color: catColor,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_categories", user?.id] });
      toast.success(editingCat ? "Category updated!" : "Category added!");
      setShowAddCat(false);
      setCatName("");
      setEditingCat(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteCatMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_categories", user?.id] });
      toast.success("Category deleted");
    },
  });

  return (
    <div className="space-y-6 md:pt-14">
      <h1 className="text-2xl font-extrabold">Settings</h1>

      {/* Currency */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={currencyCode}
            onValueChange={(code) => {
              const cur = CURRENCIES.find((c) => c.code === code);
              if (cur) updateCurrency({ code: cur.code, symbol: cur.symbol });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} — {c.name} ({c.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Categories</CardTitle>
          <Button size="sm" onClick={openAddDialog} className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.value} className="flex items-center gap-3 p-2 rounded-lg">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: cat.color + "22", color: cat.color }}
                >
                  <CatIcon className="h-4 w-4" />
                </div>
                <span className="font-medium flex-1">{cat.label}</span>
                {cat.isCustom && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditDialog(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => cat.id && deleteCatMutation.mutate(cat.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>


      {/* Add Category Dialog */}
      <Dialog open={showAddCat} onOpenChange={setShowAddCat}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">{editingCat ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!catName.trim()) return;
              addCatMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Education"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((name) => {
                  const Icon = getIconComponent(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setCatIcon(name)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-colors ${
                        catIcon === name ? "border-primary bg-primary/10" : "border-transparent bg-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCatColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      catColor === color ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-bold" disabled={addCatMutation.isPending}>
              {addCatMutation.isPending ? "Saving..." : editingCat ? "Update Category" : "Add Category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
