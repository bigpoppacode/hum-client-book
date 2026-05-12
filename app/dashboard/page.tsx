"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import FilterChips from "@/components/FilterChips";
import ClientCard from "@/components/ClientCard";
import HelpModal from "@/components/HelpModal";

interface ClientData {
  _id: string;
  name: string;
  phone: string;
  group: "VIP" | "Regular" | "New";
  tags: string[];
  rideCount: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const fetchClients = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedGroup) params.set("group", selectedGroup);
    selectedTags.forEach((tag) => params.append("tags", tag));
    if (sort) params.set("sort", sort);

    try {
      const res = await fetch(`/api/clients?${params.toString()}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedGroup, selectedTags, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchClients]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearAllFilters() {
    setSelectedGroup("");
    setSelectedTags([]);
    setSearch("");
  }

  return (
    <div className="pb-40">
      {/* Header */}
      <div className="px-4 pb-4 pt-6">
        <div className="mb-4 rounded-[2rem] bg-gradient-to-br from-slate-950 via-primary-900 to-teal-700 p-5 text-white shadow-glow">
          <div className="flex items-start justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100/80">
              Client command center
            </p>
            <button
              onClick={() => setShowHelp(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
              aria-label="Help"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Clients</h1>
              <p className="mt-2 text-sm text-sky-50/80">
                Track riders, routes, and repeat business at a glance.
              </p>
            </div>
            <div className="flex min-w-[76px] flex-col items-center rounded-2xl bg-white/15 px-4 py-3 text-center backdrop-blur">
              <p className="text-3xl font-black">{clients.length}</p>
              <p className="text-xs font-semibold text-sky-50/80">clients</p>
            </div>
          </div>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-field py-2 text-sm font-semibold"
          aria-label="Sort clients"
        >
          <option value="newest">Newest First</option>
          <option value="rides">Most Rides</option>
          <option value="alphabetical">A–Z</option>
          <option value="revenue">Highest Revenue</option>
        </select>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Filters */}
      <div className="px-4 pb-3">
        <FilterChips
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          selectedTags={selectedTags}
          onTagToggle={toggleTag}
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Client list */}
      {loading ? (
        <div className="mx-4 rounded-3xl border border-white/70 bg-white/70 px-4 py-12 text-center text-slate-500 shadow-xl shadow-slate-900/5">
          Loading your client book...
        </div>
      ) : clients.length === 0 ? (
        <div className="mx-4 mb-8 rounded-[2rem] border border-white/70 bg-white/80 px-6 py-12 text-center shadow-xl shadow-slate-900/5 backdrop-blur">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-primary-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
          <p className="mb-2 text-xl font-black text-slate-900">
            {search || selectedGroup || selectedTags.length > 0
              ? "No clients match your filters"
              : "No clients yet"}
          </p>
          <p className="mb-6 text-sm text-slate-500">
            {search || selectedGroup || selectedTags.length > 0
              ? "Try adjusting your search or filters"
              : "Add your first client to get started."}
          </p>
          {!search && !selectedGroup && selectedTags.length === 0 && (
            <Link href="/dashboard/clients/new" className="btn-primary inline-block max-w-xs">
              Add Client
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 px-4">
          {clients.map((client) => (
            <ClientCard key={client._id} client={client} />
          ))}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/dashboard/clients/new"
        className="fixed bottom-24 right-4 flex min-h-[52px] items-center gap-2 rounded-full bg-gradient-to-br from-primary-600 to-teal-500 px-5 py-3 text-white shadow-glow transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <span className="text-sm font-bold">Add Client</span>
      </Link>

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        text="Your Client Command Center. Add clients you drive for, tag them by type, and track their ride history. Use search and filters to find regulars fast. Tap a client to see their full profile and insights."
      />
    </div>
  );
}
