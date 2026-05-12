"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { computeInsights } from "@/lib/insights";
import HelpModal from "@/components/HelpModal";

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

interface RideData {
  _id: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  date: string;
  notes?: string;
}

const groupColors = {
  VIP: "bg-amber-100 text-amber-800 ring-amber-200",
  Regular: "bg-sky-100 text-sky-800 ring-sky-200",
  New: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dangerZoneRef = useRef<HTMLDivElement>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [rides, setRides] = useState<RideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [savingTags, setSavingTags] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [editGroup, setEditGroup] = useState<"VIP" | "Regular" | "New">("Regular");
  const [editRate, setEditRate] = useState("");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [toast, setToast] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientRes, ridesRes] = await Promise.all([
          fetch(`/api/clients/${params.id}`, { credentials: "include" }),
          fetch(`/api/rides?clientId=${params.id}`, { credentials: "include" }),
        ]);

        if (!clientRes.ok) {
          setError("Client not found");
          return;
        }

        const clientData = await clientRes.json();
        setClient(clientData);
        setNotes(clientData.notes || "");

        if (ridesRes.ok) {
          const ridesData = await ridesRes.json();
          setRides(ridesData);
        }
      } catch {
        setError("Failed to load client");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  async function saveNotes() {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
        credentials: "include",
      });
      if (res.ok) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      }
    } catch {
      // Silent fail for notes save
    } finally {
      setSavingNotes(false);
    }
  }

  function revealDangerZone() {
    setShowDangerZone(true);
    setTimeout(() => {
      dangerZoneRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        sessionStorage.setItem(
          "toast",
          `${client?.name || "Client"} has been deleted`
        );
        router.push("/dashboard");
      } else {
        setDeleting(false);
        setShowDeleteModal(false);
        showToast("Failed to delete client");
      }
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
      showToast("Failed to delete client");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  function startEditTags() {
    setEditTags(client?.tags ? [...client.tags] : []);
    setNewTag("");
    setEditingTags(true);
  }

  function addTag() {
    const tag = newTag.trim();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
    }
    setNewTag("");
  }

  function removeTag(tag: string) {
    setEditTags(editTags.filter((t) => t !== tag));
  }

  async function saveTags() {
    setSavingTags(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: editTags }),
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setClient(updated);
        setEditingTags(false);
        showToast("Tags updated");
      } else {
        showToast("Failed to save tags");
      }
    } catch {
      showToast("Failed to save tags");
    } finally {
      setSavingTags(false);
    }
  }

  function startEditPrefs() {
    setEditGroup(client?.group || "Regular");
    setEditRate(client?.defaultRate ? String(client.defaultRate) : "");
    setEditingPrefs(true);
  }

  async function savePrefs() {
    setSavingPrefs(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: editGroup,
          defaultRate: editRate ? Number(editRate) : undefined,
        }),
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setClient(updated);
        setEditingPrefs(false);
        showToast("Preferences updated");
      } else {
        showToast("Failed to save preferences");
      }
    } catch {
      showToast("Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-12 text-center text-slate-500">
        Loading client...
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-red-600">{error || "Client not found"}</p>
        <Link href="/dashboard" className="mt-4 inline-block font-bold text-primary-700">
          Back to clients
        </Link>
      </div>
    );
  }

  const insights = computeInsights(rides);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mx-4 mt-6 rounded-[2rem] bg-gradient-to-br from-slate-950 via-primary-900 to-teal-700 p-4 text-white shadow-glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex min-h-tap min-w-tap items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur hover:bg-white/25"
            aria-label="Back to clients"
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">{client.name}</h1>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${groupColors[client.group]}`}
              >
                {client.group}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelp(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            aria-label="Help"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>
          <Link
            href={`/dashboard/clients/${client._id}/edit`}
            className="flex min-h-tap min-w-tap items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur hover:bg-white/25"
            aria-label="Edit client"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </Link>
          <button
            onClick={revealDangerZone}
            className="flex min-h-tap min-w-tap items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur hover:bg-white/25"
            aria-label="Manage client"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 px-4 py-4">
        <a
          href={`tel:${client.phone}`}
          className="flex min-h-tap items-center gap-3 rounded-3xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-lg shadow-slate-900/5 backdrop-blur transition-all active:bg-white"
        >
          <svg
            className="h-5 w-5 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
            />
          </svg>
          <span className="font-medium">{client.phone}</span>
        </a>
        {client.email && (
          <a
            href={`mailto:${client.email}`}
          className="flex min-h-tap items-center gap-3 rounded-3xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-lg shadow-slate-900/5 backdrop-blur transition-all active:bg-white"
          >
            <svg
              className="h-5 w-5 text-primary-600"
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
            <span className="font-medium">{client.email}</span>
          </a>
        )}
      </div>

      {/* Tags */}
      <div className="px-4 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-title">Tags</h2>
          {!editingTags && (
            <button
              onClick={startEditTags}
              className="min-h-tap min-w-tap rounded-2xl px-3 py-1 text-sm font-bold text-primary-700 hover:bg-white/70"
            >
              Edit Tags
            </button>
          )}
        </div>
        {editingTags ? (
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {editTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-800"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 min-h-tap min-w-[28px] text-primary-400 hover:text-red-500"
                    aria-label={`Remove tag ${tag}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="input-field flex-1"
                placeholder="Add a tag..."
              />
              <button
                onClick={addTag}
                className="min-h-tap rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveTags}
                disabled={savingTags}
                className="btn-primary min-h-tap !w-auto px-6"
              >
                {savingTags ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditingTags(false)}
                className="btn-secondary min-h-tap !w-auto px-6"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : client.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-800"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No tags</p>
        )}
      </div>

      {/* Insights */}
      <div className="px-4 pb-4">
        <h2 className="mb-2 section-title">Insights</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-sm text-slate-500">Ride Frequency</p>
            <p className="text-lg font-black text-slate-900">
              {insights.rideFrequency}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Average Fare</p>
            <p className="text-lg font-black text-slate-900">
              ${insights.averageFare.toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Total Spent</p>
            <p className="text-lg font-black text-slate-900">
              ${insights.totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Regularity</p>
            <p className="text-lg font-black text-slate-900">
              {insights.regularityLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="px-4 pb-4">
        <h2 className="mb-2 section-title">Driver Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={3}
          className="input-field mb-2"
          placeholder="Add notes about this client..."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="btn-secondary !w-auto px-4"
          >
            {savingNotes ? "Saving..." : "Save Notes"}
          </button>
          {notesSaved && (
            <span className="text-sm text-green-600">Saved</span>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="px-4 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-title">Preferences</h2>
          {!editingPrefs && (
            <button
              onClick={startEditPrefs}
              className="min-h-tap min-w-tap rounded-2xl px-3 py-1 text-sm font-bold text-primary-700 hover:bg-white/70"
            >
              Edit
            </button>
          )}
        </div>
        {editingPrefs ? (
          <div className="space-y-3">
            <div>
              <label className="label">Group</label>
              <div className="flex gap-2">
                {(["VIP", "Regular", "New"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setEditGroup(g)}
                    className={`min-h-tap flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      editGroup === g
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="editRate" className="label">
                Default Rate
              </label>
              <input
                id="editRate"
                type="number"
                min="0"
                step="0.01"
                value={editRate}
                onChange={(e) => setEditRate(e.target.value)}
                className="input-field"
                placeholder="e.g. 25.00"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={savePrefs}
                disabled={savingPrefs}
                className="btn-primary min-h-tap !w-auto px-6"
              >
                {savingPrefs ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditingPrefs(false)}
                className="btn-secondary min-h-tap !w-auto px-6"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Group:</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${groupColors[client.group]}`}
              >
                {client.group}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Default Rate:</span>
              <span className="text-sm font-bold text-slate-900">
                {client.defaultRate && client.defaultRate > 0
                  ? `$${client.defaultRate.toFixed(2)}`
                  : "Not set"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ride History */}
      <div className="px-4 pb-4">
        <h2 className="mb-2 section-title">
          Ride History ({rides.length})
        </h2>
        {rides.length === 0 ? (
          <p className="rounded-3xl bg-white/70 py-4 text-center text-sm text-slate-400">
            No rides logged yet. Log the first ride to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {rides.map((ride) => (
              <div
                key={ride._id}
                className="flex min-h-[72px] items-center justify-between rounded-3xl border border-white/70 bg-white/80 px-4 py-3 shadow-lg shadow-slate-900/5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500">
                    {new Date(ride.date).toLocaleDateString("en-US", {
                      timeZone: "UTC",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-base font-black text-emerald-700">
                    ${ride.fare.toFixed(2)}
                  </span>
                  <Link
                    href={`/dashboard/clients/${client._id}/rides/new?prefillPickup=${encodeURIComponent(ride.pickupLocation)}&prefillDropoff=${encodeURIComponent(ride.dropoffLocation)}`}
                    className="flex min-h-tap min-w-tap items-center justify-center rounded-2xl text-sm font-bold text-primary-700 hover:bg-white/70"
                    aria-label="Book again"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      {showDangerZone && (
        <div ref={dangerZoneRef} className="mx-4 mb-4 rounded-2xl border border-red-200 bg-red-50/80 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-red-400">
            Danger Zone
          </p>
          <p className="mb-3 text-sm text-red-600">
            Deleting a client is permanent and cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="min-h-tap w-full rounded-2xl border-2 border-red-300 bg-transparent px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
          >
            Delete Client and All Rides
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-black text-slate-900">
              Delete {client.name}?
            </h3>
            <p className="mb-6 text-sm text-slate-600">
              This will permanently remove this client and all{" "}
              {rides.length} {rides.length === 1 ? "ride" : "rides"} associated
              with them. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-primary min-h-tap flex-1"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="min-h-tap flex-1 rounded-2xl border-2 border-red-400 bg-transparent px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Ride CTA */}
      <div className="px-4 pb-28 pt-2">
        <Link
          href={`/dashboard/clients/${client._id}/rides/new`}
          className="btn-primary block text-center"
        >
          {rides.length > 0 ? "Log Another Ride" : "Log Ride"}
        </Link>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed left-4 right-4 top-4 z-50 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        text="Everything about this client in one place. See their ride history, how often they ride, and what they've spent. Tap their phone number to call them directly. Use 'Book Again' to quickly log a repeat ride."
      />
    </div>
  );
}
