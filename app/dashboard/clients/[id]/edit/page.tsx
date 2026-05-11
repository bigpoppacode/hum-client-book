"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ClientForm from "@/components/ClientForm";

interface ClientData {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  tags: string[];
  group: "VIP" | "Regular" | "New";
  defaultRate?: number;
}

export default function EditClientPage() {
  const params = useParams();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${params.id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          setError("Client not found");
          return;
        }
        const data = await res.json();
        setClient(data);
      } catch {
        setError("Failed to load client");
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [params.id]);

  if (loading) {
    return (
      <div className="px-4 py-12 text-center text-gray-500">
        Loading client...
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="px-4 py-12 text-center text-red-600">
        {error || "Client not found"}
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/dashboard/clients/${params.id}`}
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
        <h1 className="text-xl font-bold text-gray-900">Edit Client</h1>
      </div>
      <ClientForm mode="edit" initialData={client} />
    </div>
  );
}
