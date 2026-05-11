"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="px-4 py-6">
      <div className="mb-5 rounded-[2rem] bg-gradient-to-br from-slate-950 via-primary-900 to-amber-600 p-5 text-white shadow-glow">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-50/80">
          Driver profile
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-amber-50/80">
          Your account and workspace controls.
        </p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-teal-500 text-2xl font-black text-white shadow-lg shadow-primary-900/20">
            {session?.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">
              {session?.user?.name || "Driver"}
            </p>
            <p className="text-sm font-medium text-slate-500">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="btn-danger"
      >
        Sign Out
      </button>
    </div>
  );
}
