"use client";

import { useEffect, useState } from "react";

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  src?: string;
}

export function useUtmParams(): UtmParams & { isFastBridge: boolean } {
  const [utmParams, setUtmParams] = useState<UtmParams>({});
  const [isFastBridge, setIsFastBridge] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: UtmParams = {};
    const keys: (keyof UtmParams)[] = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "src",
    ];

    keys.forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });

    // Brand Bridge Routing Logic
    const fastSources = ["tj", "reddit", "ads", "adult"];
    const currentSrc = utm.src?.toLowerCase();

    // Check session storage for persistence
    const savedSource = sessionStorage.getItem("traffic_source");

    let effectiveSource = currentSrc || savedSource;

    if (effectiveSource) {
      sessionStorage.setItem("traffic_source", effectiveSource);
      if (fastSources.includes(effectiveSource)) {
        setIsFastBridge(true);
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUtmParams(utm);
  }, []);

  return { ...utmParams, isFastBridge };
}

export function buildUtmQuery(utmParams: UtmParams): string {
  const entries = Object.entries(utmParams).filter(([, v]) => v);
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries as [string, string][]).toString();
}
