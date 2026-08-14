"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state !== "installed") return;
            if (!navigator.serviceWorker.controller) {
              worker.postMessage("SKIP_WAITING");
            }
          });
        });
      } catch (error) {
        console.warn("Vibe service worker failed to register.", error);
      }
    };

    void register();
  }, []);

  return null;
}
