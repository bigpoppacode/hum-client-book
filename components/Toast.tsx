"use client";

import { useState, useEffect } from "react";

export default function Toast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const msg = sessionStorage.getItem("toast");
    if (msg) {
      sessionStorage.removeItem("toast");
      setMessage(msg);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-sm rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
    >
      {message}
    </div>
  );
}
