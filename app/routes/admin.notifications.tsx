import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Megaphone, CheckCircle2 } from "lucide-react";
import { MobileShell, AppBar } from "~/marketplace/components/mobile-shell";
import { apiPost } from "~/marketplace/lib/client";
import { useAccount } from "~/marketplace/lib/use-account";
import { AppRoleEnum } from "~/marketplace/lib/types";
import { cn } from "~/lib/utils";

const AUDIENCES = [
  { id: "all", label: "Everyone" },
  { id: "customers", label: "Customers" },
  { id: "shop_owners", label: "Shop Owners" },
];

export default function AdminNotificationsPage() {
  const { account, loading } = useAccount();
  const navigate = useNavigate();
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!account || account.appRole !== AppRoleEnum.Admin) navigate("/");
  }, [account, loading, navigate]);

  async function send() {
    if (!title.trim()) return;
    setSending(true);
    const res = await apiPost("/api/admin/notifications", { audience, title, body });
    setSending(false);
    if (res.success) {
      setSent(true);
      setTitle("");
      setBody("");
      setTimeout(() => setSent(false), 2500);
    }
  }

  return (
    <MobileShell hideNav>
      <AppBar back title="Send Notification" />
      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-4">
          <Megaphone className="text-primary" />
          <p className="text-sm text-muted-foreground">
            Broadcast an announcement to your platform audience.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Audience</label>
          <div className="grid grid-cols-3 gap-2">
            {AUDIENCES.map((a) => (
              <button
                key={a.id}
                onClick={() => setAudience(a.id)}
                className={cn(
                  "rounded-xl border py-2.5 text-xs font-semibold transition",
                  audience === a.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message"
          rows={4}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />

        {sent && (
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-green-600">
            <CheckCircle2 width={16} height={16} /> Notification sent!
          </p>
        )}

        <button
          onClick={send}
          disabled={sending}
          className="w-full rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send notification"}
        </button>
      </div>
    </MobileShell>
  );
}
