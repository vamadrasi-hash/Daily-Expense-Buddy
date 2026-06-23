import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useCategories, getCategoryFromList } from "@/hooks/useCategories";
import { useCurrency, formatCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Share2, FileDown, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ShareReport() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const { currencySymbol } = useCurrency();
  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [copied, setCopied] = useState(false);

  const { data: expenses = [] } = useQuery({
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

  const filtered = useMemo(() => {
    if (!fromDate || !toDate) return [];
    const from = format(fromDate, "yyyy-MM-dd");
    const to = format(toDate, "yyyy-MM-dd");
    return expenses.filter((e) => e.date >= from && e.date <= to);
  }, [expenses, fromDate, toDate]);

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const fmt = (n: number) => formatCurrency(n, currencySymbol);

  const generateTextReport = () => {
    if (!fromDate || !toDate) return "";
    const header = `📊 SpendWise Expense Report\n📅 ${format(fromDate, "MMM d, yyyy")} → ${format(toDate, "MMM d, yyyy")}\n${"─".repeat(30)}`;
    const lines = filtered.map((e) => {
      const cat = getCategoryFromList(categories, e.category);
      return `• ${format(new Date(e.date), "MMM d")} | ${cat.label} | ${fmt(Number(e.amount))}${e.notes ? ` — ${e.notes}` : ""}`;
    });
    const footer = `${"─".repeat(30)}\n💰 Total: ${fmt(total)} (${filtered.length} expenses)`;
    return [header, ...lines, footer].join("\n");
  };

  const handleCopyText = async () => {
    const text = generateTextReport();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Report copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = generateTextReport();
    if (navigator.share) {
      try {
        await navigator.share({ title: "SpendWise Report", text });
      } catch {}
    } else {
      await handleCopyText();
    }
  };

  const handleDownloadPDF = () => {
    if (!fromDate || !toDate) return;
    const win = window.open("", "_blank");
    if (!win) { toast.error("Pop-up blocked"); return; }

    const rows = filtered.map((e) => {
      const cat = getCategoryFromList(categories, e.category);
      return `<tr><td>${format(new Date(e.date), "MMM d, yyyy")}</td><td>${cat.label}</td><td>${e.notes || "—"}</td><td style="text-align:right">${fmt(Number(e.amount))}</td></tr>`;
    }).join("");

    win.document.write(`<!DOCTYPE html><html><head><title>SpendWise Report</title>
<style>
body{font-family:system-ui,sans-serif;padding:40px;color:#1a1a2e}
h1{font-size:20px;margin-bottom:4px}
.sub{color:#666;font-size:13px;margin-bottom:24px}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:left}
th{background:#f8f8f8;font-weight:600}
.total{font-size:16px;font-weight:700;margin-top:16px;text-align:right}
@media print{body{padding:20px}}
</style></head><body>
<h1>SpendWise Expense Report</h1>
<p class="sub">${format(fromDate, "MMM d, yyyy")} — ${format(toDate, "MMM d, yyyy")} · ${filtered.length} expenses</p>
<table><thead><tr><th>Date</th><th>Category</th><th>Notes</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
<p class="total">Total: ${fmt(total)}</p>
<script>window.print();</script>
</body></html>`);
    win.document.close();
  };

  return (
    <div className="space-y-4 md:pt-14">
      <h1 className="text-2xl font-extrabold">Share Report</h1>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Select Date Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal", !fromDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "MMM d, yyyy") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal", !toDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "MMM d, yyyy") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <p className="text-sm text-muted-foreground">
            {filtered.length} expenses · Total: <span className="font-bold text-foreground">{fmt(total)}</span>
          </p>
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" /> Share as Text
            </Button>
            <Button variant="outline" onClick={handleCopyText} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Text"}
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
          </div>

          <Card className="border-0 shadow-md">
            <CardContent className="p-3">
              <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">{generateTextReport()}</pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
