"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {

  useEffect(() => {

    if ("serviceWorker" in navigator) {

      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("Service Worker Registered");
        })
        .catch((error) => {
          console.error(
            "Service Worker Registration Failed:",
            error
          );
        });

    }

  }, []);


  return null;
}