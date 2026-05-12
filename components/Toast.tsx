"use client";

import { useState, useEffect, useCallback } from "react";

type ToastType = "success" | "info";

interface ToastData {
  message: string;
  type: ToastType;
}

const styles: Record<ToastType, string> = {
  success: "bg-green-600 text-white",
  info: "bg-sky-600 text-white",
};

const durations: Record<ToastType, number> = {
  success: 3000,
  info: 5000,
};

function parseToast(raw: string, forceType?: ToastType): ToastData {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.message === "string") {
      return { message: parsed.message, type: forceType || parsed.type || "success" };
    }
  } catch {
    // plain string fallback
  }
  return { message: raw, type: forceType || "success" };
}

export default function Toast() {
  const [queue, setQueue] = useState<ToastData[]>([]);
  const [current, setCurrent] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toasts: ToastData[] = [];

    const successRaw = sessionStorage.getItem("toast");
    if (successRaw) {
      sessionStorage.removeItem("toast");
      toasts.push(parseToast(successRaw));
    }

    const infoRaw = sessionStorage.getItem("toast-info");
    if (infoRaw) {
      sessionStorage.removeItem("toast-info");
      toasts.push(parseToast(infoRaw, "info"));
    }

    if (toasts.length > 0) {
      setQueue(toasts);
    }
  }, []);

  const showNext = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const [next, ...rest] = prev;
      setCurrent(next);
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setCurrent(null);
          setQueue((q) => {
            if (q.length > 0) {
              const [n, ...r] = q;
              setCurrent(n);
              setVisible(true);
              setTimeout(() => setVisible(false), durations[n.type]);
              return r;
            }
            return q;
          });
        }, 400);
      }, durations[next.type]);
      return rest;
    });
  }, []);

  useEffect(() => {
    if (queue.length > 0 && !current) {
      showNext();
    }
  }, [queue, current, showNext]);

  if (!visible || !current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-sm items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      } ${styles[current.type]}`}
    >
      {current.type === "info" && (
        <svg
          className="h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      )}
      <span>{current.message}</span>
    </div>
  );
}
