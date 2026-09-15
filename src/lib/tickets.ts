export interface ServiceTicket {
  id: string;
  ticket_no: string;
  device: string;
  serial: string | null;
  checked_in_at: string;
  estimated_done: string | null;
  technician: string | null;
  technician_note: string | null;
  current_stage: number;
  stage_times: Record<string, string>;
}

export const STAGES: { title: string; description: string }[] = [
  { title: "Diterima", description: "Konsol telah diterima di pusat service." },
  { title: "Diagnosa", description: "Teknisi melakukan pengecekan hardware." },
  { title: "Perbaikan", description: "Penggantian komponen dan pembersihan internal sistem." },
  { title: "Quality Check", description: "Pengujian stabilitas sistem pasca perbaikan." },
  {
    title: "Siap Diambil",
    description: "Konsol siap diserahkan kembali. Bawa nota service saat pengambilan.",
  },
];

export function stageLabel(stage: number) {
  return STAGES[Math.min(Math.max(stage, 1), STAGES.length) - 1]?.title ?? "Diterima";
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${time}`;
}

export function formatShort(iso: string) {
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${time}`;
}

export function formatEstimate(date: string | null) {
  if (!date) return { day: "—", rest: "belum ditentukan" };
  const d = new Date(`${date}T00:00:00`);
  return { day: String(d.getDate()), rest: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` };
}
