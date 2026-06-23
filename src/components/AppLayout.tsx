import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { LayoutDashboard, List, BarChart3, Settings, RefreshCw, LogOut, Wallet, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: List },
  { to: "/charts", label: "Reports", icon: BarChart3 },
  { to: "/budgets", label: "Budgets", icon: Settings },
  { to: "/recurring", label: "Recurring", icon: RefreshCw },
  { to: "/share-report", label: "Share", icon: Share2 },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { displayName } = useProfile();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-lg shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">SpendWise</span>
          </Link>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-sm font-semibold truncate min-w-0">
              {displayName}
            </span>
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="shrink-0" title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-6 pb-24 md:pb-6">{children}</main>

      {/* Bottom nav (mobile) / side-ish nav items in top for desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-sm md:hidden">
        <div className="flex justify-around py-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs font-medium transition-colors rounded-lg",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop nav */}
      <nav className="hidden md:flex fixed top-14 left-0 right-0 z-30 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex gap-1 py-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for desktop nav */}
      <div className="hidden md:block h-12" style={{ position: "fixed", top: "3.5rem" }} />
    </div>
  );
}
