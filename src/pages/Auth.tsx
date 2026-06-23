import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Wallet, Mail, Lock, User, Eye, EyeOff, CheckCircle, Download, X } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsMobile(mobile);
    setShowInstallBanner(mobile && !isStandalone);
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email for a reset link!");
        setIsForgot(false);
      }
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      setLoading(false);
      if (error) {
        if (error.message === "Invalid login credentials") {
          toast.error("Incorrect email or password. Try again or reset your password.");
        } else {
          toast.error(error.message);
        }
      } else {
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: window.location.origin,
        },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        setShowVerifyDialog(true);
      }
    }
  };

  const handleVerifyDialogClose = () => {
    setShowVerifyDialog(false);
    setIsLogin(true);
    setPassword("");
  };

  const handleSignupPromptClose = () => {
    setShowSignupPrompt(false);
    setIsLogin(false);
    setPassword("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Mobile Install Banner */}
      {showInstallBanner && isMobile && (
        <div className="w-full max-w-md mb-3 animate-fade-in">
          <Link to="/install">
            <div className="flex items-center gap-3 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 relative">
              <Download className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Install SpendWise</p>
                <p className="text-xs text-muted-foreground">Add to home screen for a better experience</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInstallBanner(false); }}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Link>
        </div>
      )}
      <Card className="w-full max-w-md animate-fade-in shadow-xl border-0 bg-card">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-2">
            <Wallet className="h-7 w-7 text-primary-foreground" />
          </div>
          <p className="text-3xl font-normal text-primary tracking-tight" style={{ fontFamily: "'Pacifico', cursive" }}>SpendWise</p>
          <CardTitle className="text-xl font-bold">
            {isForgot ? "Reset Password" : isLogin ? "Welcome" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isForgot
              ? "Enter your email and we'll send a reset link"
              : isLogin
              ? "Start managing your money today"
              : "Start managing your money today"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {!isLogin && !isForgot && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>
            {!isForgot && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-bold" disabled={loading}>
              {loading
                ? "Please wait..."
                : isForgot
                ? "Send Reset Link"
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm space-y-1">
            {!isForgot && isLogin && (
              <button
                type="button"
                onClick={() => setIsForgot(true)}
                className="text-primary hover:underline font-medium"
              >
                Forgot password?
              </button>
            )}
            <p className="text-muted-foreground">
              {isForgot ? (
                <button
                  type="button"
                  onClick={() => setIsForgot(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Back to sign in
                </button>
              ) : isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
          <div className="text-center text-xs text-muted-foreground pt-2">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            {" · "}
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            {" · "}
            <Link to="/install" className="hover:underline">Install App</Link>
          </div>
        </CardContent>
      </Card>

      {/* Email Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Check Your Email</DialogTitle>
            <DialogDescription className="text-base">
              We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>. 
              Please check your inbox and click the link to verify your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleVerifyDialogClose} className="w-full sm:w-auto font-semibold">
              OK, Go to Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Signup Prompt Dialog */}
      <Dialog open={showSignupPrompt} onOpenChange={setShowSignupPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <User className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-bold">Account Not Found</DialogTitle>
            <DialogDescription className="text-base">
              No account found with <span className="font-semibold text-foreground">{email}</span>. 
              Please sign up first to create your SpendWise account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleSignupPromptClose} className="w-full sm:w-auto font-semibold">
              Go to Sign Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
