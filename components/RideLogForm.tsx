"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface RideLogFormProps {
  clientId: string;
  clientName?: string;
  defaultRate?: number;
  prefillPickup?: string;
  prefillDropoff?: string;
}

export default function RideLogForm({
  clientId,
  clientName,
  defaultRate,
  prefillPickup,
  prefillDropoff,
}: RideLogFormProps) {
  const router = useRouter();
  const fareRef = useRef<HTMLInputElement>(null);
  const [pickupLocation, setPickupLocation] = useState(prefillPickup || "");
  const [dropoffLocation, setDropoffLocation] = useState(prefillDropoff || "");
  const [fare, setFare] = useState(
    defaultRate ? defaultRate.toString() : ""
  );
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "sending" | "received" | null
  >(null);

  useEffect(() => {
    if (prefillPickup && fareRef.current) {
      fareRef.current.focus();
    }
  }, [prefillPickup]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          pickupLocation,
          dropoffLocation,
          fare: parseFloat(fare),
          date,
          notes: notes || undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save ride");
        setLoading(false);
        return;
      }

      setPaymentStep("sending");

      setTimeout(() => {
        setPaymentStep("received");

        setTimeout(() => {
          sessionStorage.setItem("toast", "Ride logged successfully");
          router.push(`/dashboard/clients/${clientId}`);
          router.refresh();
        }, 1500);
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const displayName = clientName || "client";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5 pb-28">
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50/90 p-3 text-sm font-medium text-red-700 shadow-sm"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="pickupLocation" className="label">
            Pickup Location *
          </label>
          <input
            id="pickupLocation"
            type="text"
            required
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="input-field"
            placeholder="e.g. 123 Main St"
          />
        </div>

        <div>
          <label htmlFor="dropoffLocation" className="label">
            Dropoff Location *
          </label>
          <input
            id="dropoffLocation"
            type="text"
            required
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            className="input-field"
            placeholder="e.g. Airport Terminal 2"
          />
        </div>

        <div>
          <label htmlFor="fare" className="label">
            Fare ($) *
          </label>
          <input
            ref={fareRef}
            id="fare"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            className="input-field"
            placeholder="25.00"
          />
        </div>

        <div>
          <label htmlFor="date" className="label">
            Date *
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="notes" className="label">
            Notes
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            placeholder="Optional notes about this ride..."
          />
        </div>

        <div className="pb-28 pt-2">
          <button
            type="submit"
            disabled={loading || paymentStep !== null}
            className="btn-primary"
          >
            {paymentStep
              ? "Processing..."
              : loading
              ? "Saving Ride..."
              : "Save Ride"}
          </button>
        </div>
      </form>

      {paymentStep === "sending" && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-sm items-center gap-2.5 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <svg
            className="h-5 w-5 flex-shrink-0 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
          <span>Sent payment request to {displayName}...</span>
        </div>
      )}

      {paymentStep === "received" && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-sm items-center gap-2.5 rounded-2xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
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
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Payment received from {displayName}</span>
        </div>
      )}
    </>
  );
}
