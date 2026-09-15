CREATE TABLE public.service_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_no text NOT NULL UNIQUE,
  device text NOT NULL,
  serial text,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  estimated_done date,
  technician text,
  technician_note text,
  current_stage smallint NOT NULL DEFAULT 1,
  stage_times jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_tickets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_tickets TO authenticated;
GRANT ALL ON public.service_tickets TO service_role;

ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tickets" ON public.service_tickets FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert tickets" ON public.service_tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update tickets" ON public.service_tickets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete tickets" ON public.service_tickets FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_service_tickets_updated_at BEFORE UPDATE ON public.service_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.service_tickets (ticket_no, device, serial, checked_in_at, estimated_done, technician, technician_note, current_stage, stage_times) VALUES
('PS-2026-0042', 'PlayStation 5 Disc Edition', 'AK-9928-LX', '2026-09-12T09:14:00+07', '2026-09-18', 'Rizky A.', 'Ditemukan akumulasi debu berlebih pada kipas utama. Perlu penggantian pasta termal untuk performa optimal.', 3, '{"1":"12 Sep, 09:14","2":"12 Sep, 14:30","3":"Sedang Proses"}'),
('PS-2026-0017', 'PlayStation 4 Pro', 'BR-4410-QZ', '2026-09-05T11:02:00+07', '2026-09-10', 'Dewi S.', 'Port HDMI diganti dengan unit baru. Konsol sudah lolos uji menyala 4 jam tanpa kendala.', 5, '{"1":"5 Sep, 11:02","2":"5 Sep, 15:40","3":"7 Sep, 10:20","4":"9 Sep, 16:05","5":"10 Sep, 09:00"}'),
('PS-2026-0058', 'PlayStation 5 Digital Edition', 'CN-7731-MV', '2026-09-15T08:47:00+07', '2026-09-19', 'Rizky A.', 'Unit baru masuk antrian. Diagnosa awal dijadwalkan hari ini, update berikutnya menyusul.', 1, '{"1":"15 Sep, 08:47"}');