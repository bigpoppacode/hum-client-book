"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUGGESTED_TAGS = [
  "Airport",
  "Business",
  "Medical",
  "Regular",
  "Late Night",
  "Weekend",
  "Long Distance",
  "Local",
];

interface ClientFormProps {
  initialData?: {
    _id?: string;
    name?: string;
    phone?: string;
    email?: string;
    notes?: string;
    tags?: string[];
    group?: "VIP" | "Regular" | "New";
    defaultRate?: number;
  };
  mode: "create" | "edit";
}

export default function ClientForm({ initialData, mode }: ClientFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [group, setGroup] = useState<"VIP" | "Regular" | "New">(
    initialData?.group || "New"
  );
  const [defaultRate, setDefaultRate] = useState(
    initialData?.defaultRate?.toString() || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name,
      phone,
      email: email || undefined,
      notes: notes || undefined,
      tags,
      group,
      defaultRate: defaultRate ? parseFloat(defaultRate) : undefined,
    };

    try {
      const url =
        mode === "edit"
          ? `/api/clients/${initialData?._id}`
          : "/api/clients";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save client");
        setLoading(false);
        return;
      }

      const clientId = mode === "edit" ? initialData?._id : data._id;

      if (mode === "create") {
        sessionStorage.setItem("toast", "Client added successfully");
        sessionStorage.setItem(
          "toast-info",
          JSON.stringify({
            message: `Demo Mode: In production, ${name} would receive an onboarding email with their booking link and your contact info.`,
            type: "info",
          })
        );
      }

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
        <label htmlFor="name" className="label">
          Name *
        </label>
        <input
          id="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Client name"
        />
      </div>

      <div>
        <label htmlFor="phone" className="label">
          Phone *
        </label>
        <input
          id="phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-field"
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="client@email.com"
        />
      </div>

      <div>
        <label className="label">Group *</label>
        <div className="flex gap-2">
          {(["New", "Regular", "VIP"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={`min-h-tap flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                group === g
                  ? g === "VIP"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : g === "Regular"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-green-500 bg-green-50 text-green-700"
                  : "border-white/70 bg-white/75 text-slate-600 hover:bg-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Tags</label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`min-h-tap rounded-full border px-3 py-2 text-sm transition-colors ${
                tags.includes(tag)
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-white/70 bg-white/75 text-slate-600 hover:bg-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="defaultRate" className="label">
          Default Rate ($)
        </label>
        <input
          id="defaultRate"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={defaultRate}
          onChange={(e) => setDefaultRate(e.target.value)}
          className="input-field"
          placeholder="e.g. 35.00"
        />
      </div>

      <div>
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field"
          placeholder="Any notes about this client..."
        />
      </div>

      <div className="pb-28 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? mode === "edit"
              ? "Saving..."
              : "Adding Client..."
            : mode === "edit"
            ? "Save Changes"
            : "Save Client"}
        </button>
      </div>
    </form>
  );
}
