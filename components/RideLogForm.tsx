"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface RideLogFormProps {
  clientId: string;
  defaultRate?: number;
  prefillPickup?: string;
  prefillDropoff?: string;
}

export default function RideLogForm({
  clientId,
  defaultRate,
  prefillPickup,
  prefillDropoff,
}: RideLogFormProps) {
  const router = useRouter();
  const fareRef = useRef<HTMLInputElement>(null);
  const [pickupLocation, setPickupLocation] = useState(prefillPickup || "");
  const [dropoffLocation, setDropoffLocation] = useState(prefillDropoff || "");
  const [fare, setFare] = useState(
    prefillPickup && defaultRate ? defaultRate.toString() : ""
  );
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Focus fare input when coming from Book Again (prefilled route)
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

      // Store success message for toast
      sessionStorage.setItem("toast", "Ride logged successfully");
      router.push(`/dashboard/clients/${clientId}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
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
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving Ride..." : "Save Ride"}
        </button>
      </div>
    </form>
  );
}
