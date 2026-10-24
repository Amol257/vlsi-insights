-- ============================================================================
-- VLSI Insights Database Seed: Canonical Programs & Site Stats
-- Run this script in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- Create programs table if not present
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'cpu',
  duration TEXT NOT NULL,
  duration_weeks INT NOT NULL DEFAULT 12,
  level TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  price_paise BIGINT NOT NULL,
  price_display TEXT NOT NULL,
  badge TEXT,
  brochure TEXT,
  description TEXT,
  topics JSONB DEFAULT '[]'::jsonb,
  prerequisites TEXT,
  modules JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS: public can read active programs, service_role can manage
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active programs" ON programs;
CREATE POLICY "Public can view active programs" ON programs FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Service role manages programs" ON programs;
CREATE POLICY "Service role manages programs" ON programs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Upsert Canonical Programs Data
INSERT INTO programs (id, slug, title, subtitle, category, category_label, icon, duration, duration_weeks, level, price, price_paise, price_display, badge, brochure, description, is_active)
VALUES
  ('vlsi-mastery', 'vlsi-mastery', '6-Month VLSI Mastery Job-Oriented Program', 'Comprehensive RTL design, UVM verification, and silicon tape-out pipeline', 'flagship', 'Flagship Program', 'cpu', '6 Months', 24, 'Comprehensive (Beginner to Industry Advanced)', 55000, 5500000, '₹55,000 (Incl. 18% GST)', 'Flagship Placement Track', '/images/Verification.webp', 'Our premier career accelerator covering the entire front-end ASIC flow: from Boolean algebra and synthesizable Verilog RTL to SystemVerilog OOP, UVM 1.2 testbench architecture, and multi-corner timing closure.', true),
  ('rtl-design', 'rtl-design', 'RTL Design', '3 Months, Synthesizable Verilog & ASIC Architecture', 'beginner', 'Beginners', 'cpu', '3 Months', 12, 'Foundational', 35000, 3500000, '₹35,000 (Incl. 18% GST)', 'Popular', '/images/RTL.webp', 'Master synthesizable Verilog HDL, synchronous state machines, timing constraints, and RTL microarchitecture for modern ASIC and FPGA targets.', true),
  ('verification', 'verification', 'Core VLSI Verification', '4 Months, SystemVerilog & UVM 1.2 Spec', 'beginner', 'Beginners', 'shield-check', '4 Months', 16, 'Foundational to Intermediate', 40000, 4000000, '₹40,000 (Incl. 18% GST)', 'High Demand', '/images/Verification.webp', 'Complete job-oriented training program. Master SystemVerilog core concepts, UVM testbench architecture, TCL scripting automation, and protocol verification.', true),
  ('assertions', 'assertions', 'SystemVerilog Assertions (SVA)', '1 Month, SVA and Assertion-Based Verification', 'advanced', 'Advance', 'check-circle-2', '1 Month', 4, 'Advanced', 25000, 2500000, '₹25,000 (Incl. 18% GST)', 'Specialist', '/images/Assertions.webp', 'Master SystemVerilog Assertions (SVA), concurrent sequences, temporal logic, and formal assertion-based verification (ABV).', true),
  ('fpga-prototyping', 'fpga-prototyping', 'FPGA Prototyping & Emulation', '2 Months, AMD Xilinx Vivado & Hardware Bring-Up', 'advanced', 'Advance', 'hard-drive', '2 Months', 8, 'Advanced', 30000, 3000000, '₹30,000 (Incl. 18% GST)', 'Hardware Lab', '/images/RTL.webp', 'Hands-on emulation on AMD Vivado and Xilinx UltraScale+ / Artix-7 boards. Implement high-speed interfaces, constraint generation, and hardware in-system debugging.', true),
  ('low-power', 'low-power', 'Low-Power Architecture & UPF', '1 Month, Power Gating & IEEE 1801 UPF Simulation', 'advanced', 'Advance', 'zap', '1 Month', 4, 'Advanced', 20000, 2000000, '₹20,000 (Incl. 18% GST)', 'Architect', '/images/Verification.webp', 'Techniques for energy-efficient silicon: dynamic clock gating, multi-voltage domains, retention cells, isolation rules, and Unified Power Format (UPF / CPF).', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  price_paise = EXCLUDED.price_paise,
  price_display = EXCLUDED.price_display,
  duration = EXCLUDED.duration,
  is_active = EXCLUDED.is_active;

-- Create site_stats table if not present
CREATE TABLE IF NOT EXISTS site_stats (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  number_val NUMERIC,
  label TEXT NOT NULL,
  evidence_ref TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view site stats" ON site_stats;
CREATE POLICY "Public can view site stats" ON site_stats FOR SELECT TO anon, authenticated USING (true);

INSERT INTO site_stats (key, value, number_val, label, evidence_ref)
VALUES
  ('students_trained', '200+', 200, 'Engineers & Students Trained', 'Internal alumni cohort verification database (2021-2026)'),
  ('training_tracks', '3', 3, 'Core Engineering Tracks', 'Official VLSI Insights syllabus catalog'),
  ('corporate_partners', '10+', 10, 'Corporate & Hiring Partners', 'Direct EDA and semiconductor design service partner MOUs'),
  ('years_experience', '5+', 5, 'Years Industry Pedigree', 'VLSI Insights founding & ASIC leadership tenure'),
  ('placement_rate', '94.6%', 94.6, 'Placement & Career Acceleration Rate', 'Graduated student verified employment audit'),
  ('support_sla', 'Within 24 business hours', 24, 'Published Enquiry Response SLA', 'Official VLSI Insights lead response commitment')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  number_val = EXCLUDED.number_val,
  label = EXCLUDED.label,
  evidence_ref = EXCLUDED.evidence_ref,
  updated_at = NOW();
