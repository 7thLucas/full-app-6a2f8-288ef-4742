import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { apiPost } from "~/marketplace/lib/client";

export default function LoginPage() {
  const { config } = useConfigurables();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await apiPost("/api/auth/login", { email, password });
    setLoading(false);
    if (res.success) {
      window.location.href = redirect;
    } else {
      setError(res.message || "Invalid credentials");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground">
          {(config?.appName ?? "T").charAt(0)}
        </div>
        <h1 className="text-2xl font-extrabold">{config?.appName ?? "Tester"}</h1>
        <p className="text-sm text-muted-foreground">{config?.tagline ?? "Welcome back"}</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {error && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          disabled={loading}
          className="w-full rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to={`/auth/register?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-primary">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Admin?{" "}
        <Link to="/auth/login" className="underline">
          Use your admin credentials above
        </Link>
      </p>
    </div>
  );
}
