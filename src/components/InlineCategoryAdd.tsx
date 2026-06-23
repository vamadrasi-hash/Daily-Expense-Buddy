import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AVAILABLE_ICONS, getIconComponent } from "@/hooks/useCategories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

const QUICK_COLORS = [
  "hsl(142, 71%, 45%)", "hsl(199, 89%, 48%)", "hsl(262, 83%, 58%)",
  "hsl(25, 95%, 53%)", "hsl(326, 78%, 60%)", "hsl(0, 84%, 60%)",
  "hsl(45, 93%, 47%)", "hsl(172, 66%, 50%)", "hsl(291, 64%, 42%)",
];

export default function InlineCategoryAdd({ onAdded }: { onAdded?: (value: string) => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Tag");
  const [color, setColor] = useState(QUICK_COLORS[0]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("user_categories")
        .insert({ user_id: user.id, name, icon, color })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user_categories", user?.id] });
      toast.success("Category added!");
      onAdded?.(data.id);
      setIsAdding(false);
      setName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAdding(true); }}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary hover:bg-accent rounded-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add new category
      </button>
    );
  }

  return (
    <div className="p-3 space-y-3 border-t" onClick={(e) => e.stopPropagation()}>
      <Input
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 text-sm"
        autoFocus
      />
      <div className="flex flex-wrap gap-1.5">
        {QUICK_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {AVAILABLE_ICONS.slice(0, 12).map((iconName) => {
          const Icon = getIconComponent(iconName);
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-xs transition-colors ${icon === iconName ? "bg-primary/10 border border-primary" : "bg-muted"}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="flex-1 h-8 text-xs"
          disabled={!name.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <Check className="h-3 w-3 mr-1" /> Add
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => { setIsAdding(false); setName(""); }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
