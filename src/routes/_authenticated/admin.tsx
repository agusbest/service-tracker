import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, LogOut, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STAGES, formatDateTime, type ServiceTicket } from "@/lib/tickets";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Kelola Tiket Service — KonsolCare" },
      {
        name: "description",
        content:
          "Panel admin KonsolCare untuk menambah tiket service, mengatur tanggal masuk, estimasi selesai, dan memperbarui progres perbaikan konsol.",
      },
      { property: "og:title", content: "Kelola Tiket Service — KonsolCare" },
      {
        property: "og:description",
        content: "Tambah tiket service dan perbarui progres perbaikan konsol dari satu halaman.",
      },
    ],
  }),
  component: AdminPage,
});

interface FormState {
  id: string | null;
  ticket_no: string;
  device: string;
  serial: string;
  checked_in_at: string;
  estimated_done: string;
  technician: string;
  technician_note: string;
  current_stage: number;
  stage_times: Record<string, string>;
}

const emptyForm = (): FormState => ({
  id: null,
  ticket_no: "",
  device: "PlayStation 5 Disc Edition",
  serial: "",
  checked_in_at: toLocalInput(new Date().toISOString()),
  estimated_done: "",
  technician: "",
  technician_note: "",
  current_stage: 1,
  stage_times: {},
});

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

function AdminPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_tickets")
        .select("*")
        .order("checked_in_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ServiceTicket[];
    },
  });

  const startEdit = (t: ServiceTicket) =>
    setForm({
      id: t.id,
      ticket_no: t.ticket_no,
      device: t.device,
      serial: t.serial ?? "",
      checked_in_at: toLocalInput(t.checked_in_at),
      estimated_done: t.estimated_done ?? "",
      technician: t.technician ?? "",
      technician_note: t.technician_note ?? "",
      current_stage: t.current_stage,
      stage_times: { ...(t.stage_times ?? {}) },
    });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError(null);

    const payload = {
      ticket_no: form.ticket_no.trim().toUpperCase(),
      device: form.device.trim(),
      serial: form.serial.trim() || null,
      checked_in_at: new Date(form.checked_in_at).toISOString(),
      estimated_done: form.estimated_done || null,
      technician: form.technician.trim() || null,
      technician_note: form.technician_note.trim() || null,
      current_stage: form.current_stage,
      stage_times: form.stage_times,
    };

    const { error } = form.id
      ? await supabase.from("service_tickets").update(payload).eq("id", form.id)
      : await supabase.from("service_tickets").insert(payload);

    if (error) setError(error.message);
    else {
      setForm(null);
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    }
    setBusy(false);
  };

  const remove = async (t: ServiceTicket) => {
    if (!window.confirm(`Hapus tiket ${t.ticket_no}?`)) return;
    const { error } = await supabase.from("service_tickets").delete().eq("id", t.id);
    if (error) setError(error.message);
    else await queryClient.invalidateQueries({ queryKey: ["tickets"] });
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Kelola Tiket Service</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Atur tanggal masuk, estimasi selesai, dan progres perbaikan.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="size-3.5" /> Halaman pelanggan
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-3.5" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {error && (
          <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            {error}
          </p>
        )}

        {!form && (
          <button
            onClick={() => setForm(emptyForm())}
            className="mb-8 flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-transform hover:bg-primary-light active:scale-[0.98]"
          >
            <Plus className="size-4" /> Tiket Baru
          </button>
        )}

        {form && (
          <form
            onSubmit={save}
            className="mb-10 space-y-5 rounded-[min(1vw,16px)] bg-card p-6 ring-1 ring-border"
          >
            <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              {form.id ? "Ubah Tiket" : "Tiket Baru"}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Nomor service</label>
                <input
                  required
                  value={form.ticket_no}
                  onChange={(e) => setForm({ ...form, ticket_no: e.target.value })}
                  placeholder="PS-2026-0042"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Perangkat</label>
                <input
                  required
                  value={form.device}
                  onChange={(e) => setForm({ ...form, device: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Nomor seri</label>
                <input
                  value={form.serial}
                  onChange={(e) => setForm({ ...form, serial: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Teknisi</label>
                <input
                  value={form.technician}
                  onChange={(e) => setForm({ ...form, technician: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Tanggal masuk</label>
                <input
                  type="datetime-local"
                  required
                  value={form.checked_in_at}
                  onChange={(e) => setForm({ ...form, checked_in_at: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Estimasi selesai / bisa diambil
                </label>
                <input
                  type="date"
                  value={form.estimated_done}
                  onChange={(e) => setForm({ ...form, estimated_done: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium">Catatan teknisi</label>
              <textarea
                rows={3}
                value={form.technician_note}
                onChange={(e) => setForm({ ...form, technician_note: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium">Progres saat ini</label>
              <select
                value={form.current_stage}
                onChange={(e) => setForm({ ...form, current_stage: Number(e.target.value) })}
                className={inputClass}
              >
                {STAGES.map((s, i) => (
                  <option key={s.title} value={i + 1}>
                    {i + 1}. {s.title}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Semua tahap sebelum pilihan ini otomatis ditandai selesai di halaman pelanggan.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-secondary p-4">
              <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Keterangan waktu per tahap (opsional)
              </span>
              {STAGES.map((s, i) => (
                <div key={s.title} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-muted-foreground">{s.title}</span>
                  <input
                    value={form.stage_times[String(i + 1)] ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stage_times: { ...form.stage_times, [String(i + 1)]: e.target.value },
                      })
                    }
                    placeholder="mis. 12 Sep, 09:14"
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={busy}
                className="h-11 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary-light disabled:opacity-60"
              >
                {busy ? "Menyimpan…" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="h-11 rounded-lg border border-input px-6 text-sm font-medium hover:bg-secondary"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        <section>
          <h2 className="mb-4 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Daftar Tiket
          </h2>

          {isLoading && <p className="text-sm text-muted-foreground">Memuat…</p>}
          {!isLoading && tickets.length === 0 && (
            <p className="rounded-[min(1vw,16px)] bg-card px-6 py-12 text-center text-sm text-muted-foreground ring-1 ring-border">
              Belum ada tiket. Klik “Tiket Baru” untuk menambah.
            </p>
          )}

          <ul className="space-y-3">
            {tickets.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card px-5 py-4 ring-1 ring-border"
              >
                <div>
                  <p className="text-sm font-medium">
                    {t.ticket_no}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      · {t.device}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Masuk {formatDateTime(t.checked_in_at)} · Tahap {t.current_stage}/5:{" "}
                    <span className="text-primary">{STAGES[t.current_stage - 1]?.title}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(t)}
                    className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-2 text-xs font-medium hover:bg-secondary"
                  >
                    <Pencil className="size-3.5" /> Ubah
                  </button>
                  <button
                    onClick={() => remove(t)}
                    className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="size-3.5" /> Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
