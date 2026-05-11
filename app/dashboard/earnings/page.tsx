"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface EarningsSummary {
  totalEarnings: number;
  totalRides: number;
  averageFare: number;
  topClient: { name: string; total: number } | null;
  recentRides: {
    _id: string;
    date: string;
    pickupLocation: string;
    dropoffLocation: string;
    fare: number;
    clientName: string;
    clientId: string;
  }[];
}

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

export default function EarningsPage() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rides/summary?period=${period}`, {
        credentials: "include",
      });
      if (res.ok) {
        const summary = await res.json();
        setData(summary);
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="pb-28">
      <div className="px-4 py-6">
        <div className="mb-5 rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-primary-800 p-5 text-white shadow-glow">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-50/80">
            Revenue pulse
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Earnings</h1>
          <p className="mt-2 text-sm text-emerald-50/80">
            Watch fare totals, ride volume, and best clients move over time.
          </p>
        </div>

        {/* Period Tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-white/70 bg-white/70 p-1 shadow-sm backdrop-blur">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`min-h-tap flex-1 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white/70 py-12 text-center text-slate-500 shadow-xl shadow-slate-900/5">
            Loading earnings...
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="card">
                <p className="section-title">Total Earnings</p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  ${data.totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="card">
                <p className="section-title">Total Rides</p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {data.totalRides}
                </p>
              </div>
              <div className="card">
                <p className="section-title">Average Fare</p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  ${data.averageFare.toFixed(2)}
                </p>
              </div>
              <div className="card">
                <p className="section-title">Top Client</p>
                {data.topClient ? (
                  <>
                    <p className="mt-2 truncate text-lg font-black text-slate-900">
                      {data.topClient.name}
                    </p>
                    <p className="text-sm font-semibold text-emerald-700">
                      ${data.topClient.total.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-slate-400">-</p>
                )}
              </div>
            </div>

            {/* Recent Rides */}
            <h2 className="mb-3 section-title">
              Recent Rides
            </h2>
            {data.recentRides.length === 0 ? (
              <p className="rounded-3xl bg-white/70 py-6 text-center text-sm text-slate-400">
                No rides in this period
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentRides.map((ride) => (
                  <Link
                    key={ride._id}
                    href={`/dashboard/clients/${ride.clientId}`}
                    className="flex min-h-[72px] items-center justify-between rounded-3xl border border-white/70 bg-white/80 px-4 py-3 shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {ride.clientName}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {new Date(ride.date).toLocaleDateString("en-US", {
                            timeZone: "UTC",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="truncate text-sm text-slate-500">
                        {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                      </p>
                    </div>
                    <span className="ml-2 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 font-black text-emerald-700">
                      ${ride.fare.toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="rounded-3xl bg-white/70 py-12 text-center text-slate-500">
            Failed to load earnings data
          </p>
        )}
      </div>
    </div>
  );
}
