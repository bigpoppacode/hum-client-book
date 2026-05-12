"use client";

import { useState } from "react";
import ClientForm from "@/components/ClientForm";
import Link from "next/link";
import HelpModal from "@/components/HelpModal";

export default function NewClientPage() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        <button
          onClick={() => setShowHelp(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-500 shadow-sm hover:bg-white"
          aria-label="Help"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </button>
      </div>
      <p className="mb-6 rounded-3xl bg-white/70 p-4 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
        Required fields are marked with *. Everything can be edited later.
      </p>
      <ClientForm mode="create" />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        text="Save a new client's info. Name and phone are required. Add tags like 'Airport' or 'VIP' to organize your book. Set a default rate to speed up ride logging later."
      />
    </div>
  );
}
