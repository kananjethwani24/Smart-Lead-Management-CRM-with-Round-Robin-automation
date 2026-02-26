-- =====================================================
-- Sales CRM Database Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- =====================================================

-- 1. Callers table - Sales team members
CREATE TABLE callers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  languages TEXT[] DEFAULT '{}',
  daily_lead_limit INTEGER DEFAULT 60,
  assigned_states TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Leads table - Leads from Google Sheets
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  lead_source TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  metadata TEXT DEFAULT '',
  sheet_row_number INTEGER UNIQUE,
  assigned_caller_id UUID REFERENCES callers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Round Robin state tracking
CREATE TABLE round_robin_state (
  id SERIAL PRIMARY KEY,
  state_key TEXT UNIQUE NOT NULL DEFAULT '__global__',
  last_caller_id UUID REFERENCES callers(id) ON DELETE SET NULL
);

-- 4. Indexes for query performance
CREATE INDEX idx_leads_state ON leads(state);
CREATE INDEX idx_leads_assigned ON leads(assigned_caller_id);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_leads_sheet_row ON leads(sheet_row_number);

-- 5. Enable Row Level Security (but allow all for service role)
ALTER TABLE callers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_robin_state ENABLE ROW LEVEL SECURITY;

-- Allow full access via service role and anon key (for this demo)
CREATE POLICY "Allow all on callers" ON callers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on round_robin_state" ON round_robin_state FOR ALL USING (true) WITH CHECK (true);

-- 6. Enable Realtime for leads table (for live UI updates)
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE callers;

-- Announcements Table
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_name TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Present',
  UNIQUE(caller_name, date)
);

ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
