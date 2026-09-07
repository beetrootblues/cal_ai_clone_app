import { useEffect, useState } from "react";
import { useUser } from "./lib/userContext";
import { dateKeyLocal } from "./lib/health";
import Home from "./screens/Home";
import Scan from "./screens/Scan";
import History from "./screens/History";
import Progress from "./screens/Progress";
import Profile from "./screens/Profile";
import Onboarding from "./screens/Onboarding";
import InstallGuide from "./screens/InstallGuide";
import Landing from "./screens/Landing";
import BottomNav, { type TabKey } from "./components/BottomNav";
import { Download, X } from "lucide-react";

type Screen = TabKey | "install";

const INSTALL_SEEN_KEY = "calai_install_seen_v1";

function Shell() {
  const { user, loading } = useUser();
  const [screen, setScreen] = useState<Screen>("home");
  const today = useMemoDateKey();

  const [dismissedInstall, setDismissedInstall] = useState(
    () => localStorage.getItem(INSTALL_SEEN_KEY) === "1"
  );

  // Reset to home whenever auth state changes (sign in / out)
  useEffect(() => {
    setScreen("home");
  }, [user?._id]);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  const dismissInstall = () => {
    localStorage.setItem(INSTALL_SEEN_KEY, "1");
    setDismissedInstall(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#09090b]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d3fd50] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (!user.onboardingComplete) {
    return <Onboarding />;
  }

  const showInstallBanner = !dismissedInstall && screen !== "install" && !isStandalone;

  return (
    <div className="min-h-dvh bg-[#09090b] text-zinc-50">
      <div className="mx-auto max-w-md">
        <main className="pb-tab">
          {screen === "home" && <Home onGoScan={() => setScreen("scan")} />}
          {screen === "scan" && <Scan dateKey={today} />}
          {screen === "history" && <History />}
          {screen === "progress" && <Progress />}
          {screen === "profile" && <Profile onGoInstall={() => setScreen("install")} />}
          {screen === "install" && <InstallGuide onBack={() => setScreen("home")} />}
        </main>
        {screen !== "install" && (
          <BottomNav value={screen as TabKey} onChange={(s) => setScreen(s as Screen)} />
        )}
      </div>

      {showInstallBanner && (
        <div className="fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-[#d3fd50]/25 bg-[#141410]/95 p-3 shadow-xl backdrop-blur-xl">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d3fd50] text-[#09090b]">
              <Download size={17} />
            </span>
            <button onClick={() => setScreen("install")} className="min-w-0 flex-1 text-left">
              <div className="text-[13px] font-bold">Add Cal AI to Home Screen</div>
              <div className="text-[11px] text-zinc-400">Full-screen app, works offline</div>
            </button>
            <button
              onClick={dismissInstall}
              aria-label="Dismiss"
              className="text-zinc-500 active:scale-90"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function useMemoDateKey() {
  const [key] = useState(() => dateKeyLocal());
  return key;
}

export default function App() {
  return <Shell />;
}
