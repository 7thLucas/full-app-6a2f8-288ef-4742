import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ShoppingBag, Store } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { apiPost } from "~/marketplace/lib/client";
import { AppRoleEnum } from "~/marketplace/lib/types";
import { cn } from "~/lib/utils";

export default function RegisterPage() {
  const { config } = useConfigurables();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [role, setRole] = useState<string>(AppRoleEnum.Customer);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await apiPost("/api/account/register", {
      appRole: role,
      fullName,
      username,
      email,
      phone,
      password,
    });
    setLoading(false);
    if (res.success) {
      window.location.href = role === AppRoleEnum.ShopOwner ? "/owner" : redirect;
    } else {
      setError(res.message || "Registration failed");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Join {config?.appName ?? "Tester"}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole(AppRoleEnum.Customer)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-sm font-semibold transition",
            role === AppRoleEnum.Customer ? "border-primary bg-primary/5 text-primary" : "border-border bg-card",
          )}
        >
          <ShoppingBag />
          Customer
        </button>
        <button
          type="button"
          onClick={() => setRole(AppRoleEnum.ShopOwner)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-sm font-semibold transition",
            role === AppRoleEnum.ShopOwner ? "border-primary bg-primary/5 text-primary" : "border-border bg-card",
          )}
        >
          <Store />
          Shop Owner
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {error && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          disabled={loading}
          className="w-full rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to={`/auth/login?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
