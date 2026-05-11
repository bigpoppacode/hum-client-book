"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell flex min-h-screen flex-col px-5 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-teal-400 text-2xl font-black text-white shadow-glow">
            H
          </div>
          <p className="section-title mb-3">Driver CRM</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            HUM Client Book
          </h1>
          <p className="mt-3 text-base leading-6 text-slate-600">
            Your polished command center for loyal riders, repeat routes, and
            better fares.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 p-3 text-sm font-medium text-red-700 shadow-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="soft-panel space-y-4 p-5">
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-primary-700 hover:text-primary-500"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
