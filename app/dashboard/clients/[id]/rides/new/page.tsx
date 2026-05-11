"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import RideLogForm from "@/components/RideLogForm";

export default function NewRidePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params.id as string;
  const prefillPickup = searchParams.get("prefillPickup") || undefined;
  const prefillDropoff = searchParams.get("prefillDropoff") || undefined;
  const [defaultRate, setDefaultRate] = useState<number | undefined>(undefined);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${clientId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setDefaultRate(data.defaultRate);
          setClientName(data.name);
        }
      } catch {
        // Continue without default rate
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [clientId]);

  if (loading) {
    return (
      <div className="px-4 py-12 text-center text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="flex min-h-tap min-w-tap items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Back to client"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {prefillPickup ? "Book Again" : "Log Ride"}
          </h1>
          {clientName && (
            <p className="text-sm text-gray-500">for {clientName}</p>
          )}
        </div>
      </div>
      <RideLogForm
        clientId={clientId}
        defaultRate={defaultRate}
        prefillPickup={prefillPickup}
        prefillDropoff={prefillDropoff}
      />
    </div>
  );
}
