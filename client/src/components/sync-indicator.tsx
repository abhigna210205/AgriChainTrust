import { useState, useEffect } from "react";
import { Wifi, WifiOff, RotateCw, Check } from "lucide-react";

export default function SyncIndicator() {
  const [syncStatus, setSyncStatus] = useState<"syncing" | "offline" | "synced">("syncing");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setSyncStatus("offline");
    } else {
      // Simulate sync status changes
      const interval = setInterval(() => {
        setSyncStatus((prev) => {
          if (prev === "syncing") return "synced";
          if (prev === "synced") return "syncing";
          return "syncing";
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const getStatusConfig = () => {
    switch (syncStatus) {
      case "syncing":
        return {
          className: "sync-indicator syncing",
          icon: <RotateCw className="w-4 h-4 animate-spin" />,
          text: "Syncing to blockchain...",
        };
      case "offline":
        return {
          className: "sync-indicator offline",
          icon: <WifiOff className="w-4 h-4" />,
          text: "Offline - Changes saved locally",
        };
      case "synced":
        return {
          className: "sync-indicator",
          icon: <Check className="w-4 h-4" />,
          text: "All data synchronized",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={config.className} data-testid={`sync-status-${syncStatus}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}
