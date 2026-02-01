"use client";

import { useEffect, useState, useCallback } from "react";

export function useExitIntent(delay = 3000): {
  showModal: boolean;
  dismiss: () => void;
} {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(() => {
    setShowModal(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("exit_intent_dismissed", "true");
    } catch { }
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("exit_intent_dismissed") === "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDismissed(true);
        return;
      }
    } catch { }

    const timeout = setTimeout(() => {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && !dismissed) {
          setShowModal(true);
        }
      };

      document.addEventListener("mouseleave", handleMouseLeave);
      return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, dismissed]);

  return { showModal, dismiss };
}
