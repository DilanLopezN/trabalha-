"use client";

import { useCallback } from "react";

export function useApi() {
  const getCsrfToken = useCallback(() => {
    if (typeof document === "undefined") return null;

    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("csrf-token="));

    return cookie?.split("=")[1] ?? null;
  }, []);

  const request = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const method = (options.method || "GET").toUpperCase();
      const isMutating = !["GET", "HEAD", "OPTIONS"].includes(method);

      const csrfToken = getCsrfToken();

      const headers: HeadersInit = {
        ...(options.headers || {}),
        ...(isMutating && csrfToken ? { "x-csrf-token": csrfToken } : {}),
      };

      try {
        const res = await fetch(url, {
          ...options,
          credentials: "include",
          headers,
        });

        const contentType = res.headers.get("content-type");
        const isJson = contentType?.includes("application/json");

        const data = isJson ? await res.json() : await res.text();

        if (!res) {
          throw {
            message: (data as any)?.error || data || "Request error",
          };
        }

        return data;
      } catch (err: any) {
        console.error("API Error:", err);
        throw err;
      }
    },
    [getCsrfToken]
  );

  return { api: request };
}
