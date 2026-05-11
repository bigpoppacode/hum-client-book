"use client";

import Link from "next/link";

interface ClientCardProps {
  client: {
    _id: string;
    name: string;
    phone: string;
    group: "VIP" | "Regular" | "New";
    tags: string[];
    rideCount: number;
    totalRevenue: number;
  };
}

const groupColors = {
  VIP: "bg-amber-100 text-amber-800 ring-amber-200",
  Regular: "bg-sky-100 text-sky-800 ring-sky-200",
  New: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export default function ClientCard({ client }: ClientCardProps) {
  return (
    <Link
      href={`/dashboard/clients/${client._id}`}
      className="group flex min-h-[86px] items-center gap-4 rounded-[1.75rem] border border-white/70 bg-white/85 px-4 py-4 shadow-xl shadow-slate-900/5 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-2xl active:translate-y-0"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-primary-700 text-lg font-black text-white shadow-lg shadow-slate-900/20">
        {client.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-lg font-black text-slate-900">
            {client.name}
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${groupColors[client.group]}`}
          >
            {client.group}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-sm font-medium text-slate-500">
          <span>{client.rideCount} ride{client.rideCount !== 1 ? "s" : ""}</span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
            ${client.totalRevenue.toFixed(2)}
          </span>
        </div>
      </div>
      <svg
        className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </Link>
  );
}
