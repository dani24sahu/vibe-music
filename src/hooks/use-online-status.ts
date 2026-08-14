"use client";

import { useEffect, useState } from "react";
import { isBrowserOnline } from "@/lib/offline/cache-policy";

export function useOnlineStatus() {
  const [online, setOnline] = useState(isBrowserOnline);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setOnline(navigator.onLine !== false);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return online;
}
