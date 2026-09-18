import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk Admin — KonsolCare" },
      {
        name: "description",
        content:
          "Halaman masuk untuk admin KonsolCare: kelola tiket service PlayStation, tanggal masuk, dan progres perbaikan.",
      },
      { property: "og:title", content: "Masuk Admin — KonsolCare" },
      {
        property: "og:description",
        content: "Masuk untuk mengelola tiket service dan progres perbaikan konsol.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) setError(error.message);
      else if (!data.session)
        setMessage("Akun dibuat. Cek email kamu untuk konfirmasi, lalu masuk di sini.");
      else navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate({ to: "/admin" });
    }
    setBusy(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 font-sans">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Masuk Admin" : "Daftar Admin"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kelola tiket service dan progres perbaikan konsol.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium">
              Kata sandi
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {message && <p className="text-xs text-primary">{message}</p>}

          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-transform hover:bg-primary-light active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Memproses…" : mode === "signin" ? "Masuk" : "Daftar"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
          className="mt-6 text-xs text-muted-foreground hover:text-primary"
        >
          {mode === "signin"
            ? "Belum punya akun admin? Daftar"
            : "Sudah punya akun? Masuk di sini"}
        </button>

        {/* <div className="mt-8">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
            ← Kembali ke halaman lacak
          </Link>
        </div> */}
      </div>
    </div>
  );
}
