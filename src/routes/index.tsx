import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Search, MessageCircle, TriangleAlert } from "lucide-react";
import ps5Workshop from "@/assets/ps5-workshop.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Service Tracker" },
      {
        name: "description",
        content:
          "Masukkan nomor tiket service untuk melihat tanggal masuk, progres perbaikan konsol PlayStation-mu, dan estimasi kapan bisa diambil.",
      },
      { property: "og:title", content: "Lacak Service PlayStation — KonsolCare" },
      {
        property: "og:description",
        content:
          "Masukkan nomor tiket service untuk melihat tanggal masuk, progres perbaikan konsol PlayStation-mu, dan estimasi kapan bisa diambil.",
      },
    ],
  }),
  component: TrackingPage,
});

type StepStatus = "done" | "active" | "pending";

interface TimelineStep {
  title: string;
  description: string;
  timestamp?: string;
  status: StepStatus;
}

interface Ticket {
  id: string;
  device: string;
  serial: string;
  checkedInAt: string;
  estimatedDone: { day: string; rest: string };
  technician: string;
  technicianNote: string;
  statusLabel: string;
  steps: TimelineStep[];
}

const TICKETS: Record<string, Ticket> = {
  "PS-2026-0042": {
    id: "PS-2026-0042",
    device: "PlayStation 5 Disc Edition",
    serial: "AK-9928-LX",
    checkedInAt: "12 Sep 2026, 09:14",
    estimatedDone: { day: "18", rest: "Sep 2026" },
    technician: "Rizky A.",
    technicianNote:
      "Ditemukan akumulasi debu berlebih pada kipas utama. Perlu penggantian pasta termal untuk performa optimal.",
    statusLabel: "Sedang Diperbaiki",
    steps: [
      {
        title: "Diterima",
        description: "Konsol telah diterima di pusat service.",
        timestamp: "12 Sep, 09:14",
        status: "done",
      },
      {
        title: "Diagnosa",
        description: "Teknisi sedang melakukan pengecekan hardware.",
        timestamp: "12 Sep, 14:30",
        status: "done",
      },
      {
        title: "Perbaikan Sedang Berlangsung",
        description: "Penggantian modul kipas dan pembersihan internal sistem.",
        timestamp: "Sedang Proses",
        status: "active",
      },
      {
        title: "Quality Check",
        description: "Pengujian stabilitas sistem pasca perbaikan.",
        status: "pending",
      },
      {
        title: "Siap Diambil",
        description: "Konsol siap untuk diserahkan kembali kepada pelanggan.",
        status: "pending",
      },
    ],
  },
  "PS-2026-0017": {
    id: "PS-2026-0017",
    device: "PlayStation 4 Pro",
    serial: "BR-4410-QZ",
    checkedInAt: "5 Sep 2026, 11:02",
    estimatedDone: { day: "10", rest: "Sep 2026" },
    technician: "Dewi S.",
    technicianNote:
      "Port HDMI diganti dengan unit baru. Konsol sudah lolos uji menyala 4 jam tanpa kendala.",
    statusLabel: "Siap Diambil",
    steps: [
      {
        title: "Diterima",
        description: "Konsol telah diterima di pusat service.",
        timestamp: "5 Sep, 11:02",
        status: "done",
      },
      {
        title: "Diagnosa",
        description: "Teknisi sedang melakukan pengecekan hardware.",
        timestamp: "5 Sep, 15:40",
        status: "done",
      },
      {
        title: "Perbaikan",
        description: "Penggantian port HDMI dan pembersihan internal.",
        timestamp: "7 Sep, 10:20",
        status: "done",
      },
      {
        title: "Quality Check",
        description: "Pengujian stabilitas sistem pasca perbaikan.",
        timestamp: "9 Sep, 16:05",
        status: "done",
      },
      {
        title: "Siap Diambil",
        description:
          "Konsol selesai diperbaiki. Silakan ambil di cabang dengan membawa nota service.",
        timestamp: "10 Sep, 09:00",
        status: "active",
      },
    ],
  },
  "PS-2026-0058": {
    id: "PS-2026-0058",
    device: "PlayStation 5 Digital Edition",
    serial: "CN-7731-MV",
    checkedInAt: "15 Sep 2026, 08:47",
    estimatedDone: { day: "19", rest: "Sep 2026" },
    technician: "Rizky A.",
    technicianNote:
      "Unit baru masuk antrian. Diagnosa awal dijadwalkan hari ini, update berikutnya menyusul.",
    statusLabel: "Baru Diterima",
    steps: [
      {
        title: "Diterima",
        description: "Konsol telah diterima di pusat service.",
        timestamp: "15 Sep, 08:47",
        status: "active",
      },
      {
        title: "Diagnosa",
        description: "Teknisi sedang melakukan pengecekan hardware.",
        status: "pending",
      },
      {
        title: "Perbaikan",
        description: "Proses penggantian komponen yang rusak.",
        status: "pending",
      },
      {
        title: "Quality Check",
        description: "Pengujian stabilitas sistem pasca perbaikan.",
        status: "pending",
      },
      {
        title: "Siap Diambil",
        description: "Konsol siap untuk diserahkan kembali kepada pelanggan.",
        status: "pending",
      },
    ],
  },
};

function TrackingPage() {
  const [query, setQuery] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = TICKETS[query.trim().toUpperCase()];
    setTicket(found ?? null);
    setNotFound(!found);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header / Search */}
      <header className="border-b border-border bg-card pt-16 pb-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 flex justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary ring-4 ring-primary/10">
              <div className="size-6 rotate-45 border-2 border-primary-foreground" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="mb-4 text-3xl leading-tight font-semibold tracking-tight text-balance">
              Lacak Service PlayStation-mu
            </h1>
            <p className="mx-auto max-w-[56ch] text-pretty text-muted-foreground">
              Pantau status perbaikan konsol Anda — kapan masuk, sudah sampai
              mana progresnya, dan estimasi kapan bisa diambil.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-lg">
            <div className="relative flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-grow">
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nomor Service (mis. PS-2026-0042)"
                  aria-label="Nomor service"
                  className="h-11 w-full rounded-lg border border-input bg-card pr-4 pl-11 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-11 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-transform hover:bg-primary-light focus:ring-4 focus:ring-primary/20 active:scale-[0.98]"
              >
                Lacak
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Coba tiket demo:{" "}
              {Object.keys(TICKETS).map((id, i) => (
                <span key={id}>
                  {i > 0 && ", "}
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(id);
                      setTicket(TICKETS[id] ?? null);
                      setNotFound(false);
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    {id}
                  </button>
                </span>
              ))}
            </p>
          </form>
        </div>
      </header>

      {/* Result */}
      <main className="py-12">
        <div className="mx-auto max-w-3xl px-6">
          {notFound && (
            <div className="animate-step-in flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-5">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold">Nomor service tidak ditemukan</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pastikan nomor yang dimasukkan sama persis dengan yang tertera
                  pada nota. Hubungi kami jika tetap tidak bisa dilacak.
                </p>
              </div>
            </div>
          )}

          {!ticket && !notFound && (
            <div className="rounded-[min(1vw,16px)] bg-card px-8 py-16 text-center ring-1 ring-border">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
                <Search className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Masukkan nomor tiket service di atas untuk melihat status
                perbaikan konsolmu.
              </p>
            </div>
          )}

          {ticket && (
            <article
              key={ticket.id}
              className="animate-step-in overflow-hidden rounded-[min(1vw,16px)] bg-card ring-1 ring-border"
            >
              {/* Ticket meta */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-8 py-6">
                <div>
                  <span className="mb-1 block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Nomor Service
                  </span>
                  <span className="text-lg font-medium">{ticket.id}</span>
                </div>
                <div className="text-right">
                  <span className="mb-1 block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Perangkat
                  </span>
                  <span className="text-sm font-medium">{ticket.device}</span>
                </div>
              </div>

              {/* Status area */}
              <div className="flex flex-col gap-12 p-8 md:flex-row">
                {/* Timeline */}
                <div className="flex-grow">
                  <h2 className="mb-8 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                    Status Perbaikan
                  </h2>

                  <div className="relative space-y-0">
                    <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-border" />
                    {ticket.steps.map((step, i) => (
                      <div
                        key={step.title}
                        className={`relative pl-10 ${i < ticket.steps.length - 1 ? "pb-10" : ""} ${step.status === "pending" ? "opacity-60" : ""}`}
                      >
                        <div
                          className={`absolute top-1.5 left-0 flex size-6 items-center justify-center rounded-full ring-4 ring-card ${
                            step.status === "pending" ? "bg-border" : "bg-primary"
                          }`}
                        >
                          <div
                            className={`rounded-full ${
                              step.status === "pending"
                                ? "size-1.5 bg-muted-foreground"
                                : step.status === "active"
                                  ? "size-2 animate-pulse bg-primary-foreground"
                                  : "size-1.5 bg-primary-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3
                              className={`text-sm ${
                                step.status === "active"
                                  ? "font-semibold text-primary"
                                  : "font-semibold"
                              }`}
                            >
                              {step.title}
                            </h3>
                            <p className="mt-1 max-w-[48ch] text-xs text-pretty text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                          {step.timestamp && (
                            <span
                              className={`shrink-0 rounded px-2 py-1 text-[11px] font-medium ${
                                step.status === "active"
                                  ? "bg-primary/5 text-primary"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {step.timestamp}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <aside className="w-full shrink-0 space-y-6 md:w-64">
                  <div className="rounded-xl border border-border bg-secondary p-5">
                    <span className="mb-3 block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Estimasi Selesai
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold">{ticket.estimatedDone.day}</span>
                      <span className="text-sm font-medium">{ticket.estimatedDone.rest}</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      Waktu dapat berubah tergantung ketersediaan suku cadang
                      tambahan.
                    </p>
                  </div>

                  <dl className="space-y-3 px-2 text-xs">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Masuk tanggal</dt>
                      <dd className="font-medium">{ticket.checkedInAt}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Serial</dt>
                      <dd className="font-medium uppercase">{ticket.serial}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Teknisi</dt>
                      <dd className="font-medium">{ticket.technician}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium text-primary">{ticket.statusLabel}</dd>
                    </div>
                  </dl>

                  <div className="p-2">
                    <span className="mb-3 block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Catatan Teknisi
                    </span>
                    <p className="text-xs text-pretty text-muted-foreground italic">
                      “{ticket.technicianNote}”
                    </p>
                  </div>

                  <img
                    src={ps5Workshop}
                    alt="Konsol PlayStation 5 di meja kerja bengkel service"
                    width={768}
                    height={768}
                    loading="lazy"
                    className="aspect-square w-full rounded-[min(1vw,12px)] object-cover outline-1 -outline-offset-1 outline-border"
                  />
                </aside>
              </div>

              {/* Footer action */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-border bg-secondary/50 px-8 py-4 sm:flex-row">
                <p className="text-[11px] text-muted-foreground">
                  Butuh bantuan mendesak? Hubungi teknisi kami melalui WhatsApp.
                </p>
                <a
                  href={`https://wa.me/6285319006656?text=${encodeURIComponent(
                    `Halo, saya mau tanya status service ${ticket.id}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <MessageCircle className="size-4" />
                  Hubungi Support
                </a>
              </div>
            </article>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 ServiceTracker
          </p>
        </div>
      </footer>
    </div>
  );
}
