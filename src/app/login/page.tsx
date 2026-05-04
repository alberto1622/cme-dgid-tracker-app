"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });

    setLoading(false);
    if (!res || res.error) {
      setError("Identifiants invalides");
      return;
    }
    router.push(res.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border rounded-xl shadow-sm p-6 space-y-4"
      >
        <div>
          <h1 className="text-xl font-semibold">Connexion</h1>
          <p className="text-sm text-muted-foreground">Accédez au tableau de bord CME.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
