import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share, Plus, Smartphone, Monitor, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full border-0 shadow-lg text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-extrabold">Already Installed!</h2>
            <p className="text-muted-foreground">SpendWise is installed on your device. Open it from your home screen.</p>
            <Link to="/">
              <Button className="mt-2">Open App</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <Link to="/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Settings
        </Link>

        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg">
            <img src="/icon-192.png" alt="SpendWise" className="w-20 h-20 rounded-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold">Install SpendWise</h1>
          <p className="text-muted-foreground">Add SpendWise to your home screen for a native app experience — no app store needed!</p>
        </div>

        {/* Android / Chrome install button */}
        {deferredPrompt && (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 pb-6">
              <Button onClick={handleInstall} className="w-full h-12 text-base font-bold gap-2" size="lg">
                <Download className="h-5 w-5" /> Install SpendWise
              </Button>
            </CardContent>
          </Card>
        )}

        {/* iOS Instructions */}
        {isIOS && !deferredPrompt && (
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Smartphone className="h-5 w-5" /> Install on iPhone / iPad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step number={1} icon={<Share className="h-5 w-5" />} text='Tap the Share button in Safari' />
              <Step number={2} icon={<Plus className="h-5 w-5" />} text='Scroll down and tap "Add to Home Screen"' />
              <Step number={3} icon={<Download className="h-5 w-5" />} text='Tap "Add" to confirm' />
            </CardContent>
          </Card>
        )}

        {/* Android fallback instructions */}
        {isAndroid && !deferredPrompt && (
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Smartphone className="h-5 w-5" /> Install on Android
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step number={1} text='Open this page in Chrome browser' />
              <Step number={2} text='Tap the ⋮ menu (top right)' />
              <Step number={3} text='Tap "Add to Home screen" or "Install app"' />
            </CardContent>
          </Card>
        )}

        {/* Desktop instructions */}
        {!isIOS && !isAndroid && !deferredPrompt && (
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Monitor className="h-5 w-5" /> Install on Desktop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step number={1} text='Open this page in Chrome or Edge' />
              <Step number={2} text='Click the install icon (⊕) in the address bar' />
              <Step number={3} text='Click "Install" to confirm' />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Step({ number, icon, text }: { number: number; icon?: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
        {number}
      </div>
      <div className="flex items-center gap-2 pt-1">
        {icon}
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  );
}
