"use client";

import ClientForm from "@/components/ClientForm";
import Link from "next/link";

export default function NewClientPage() {
  return (
    <div className="px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex min-h-tap min-w-tap items-center justify-center rounded-2xl bg-white/75 text-slate-600 shadow-sm backdrop-blur hover:bg-white"
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
          <p className="section-title">New relationship</p>
          <h1 className="text-3xl font-black text-slate-950">Add Client</h1>
        </div>
      </div>
      <p className="mb-6 rounded-3xl bg-white/70 p-4 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
        Required fields are marked with *. Everything can be edited later.
      </p>
      <ClientForm mode="create" />
    </div>
  );
}
