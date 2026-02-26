-- =====================================================
-- Sales CRM Database Schema for MySQL
-- =====================================================

-- 1. Callers table - Sales team members
CREATE TABLE IF NOT EXISTS callers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT '',
  languages JSON, -- Store as JSON array ["English", "Hindi"]
  daily_lead_limit INT DEFAULT 60,
  assigned_states JSON, -- Store as JSON array ["Delhi", "Punjab"]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Leads table - Leads from Google Sheets
CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT '',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lead_source VARCHAR(255) DEFAULT '',
  city VARCHAR(255) DEFAULT '',
  state VARCHAR(255) DEFAULT '',
  metadata TEXT DEFAULT NULL,
  sheet_row_number INT UNIQUE,
  assigned_caller_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_caller_id) REFERENCES callers(id) ON DELETE SET NULL
);

-- 3. Round Robin state tracking
CREATE TABLE IF NOT EXISTS round_robin_state (
  id INT AUTO_INCREMENT PRIMARY KEY,
  state_key VARCHAR(255) UNIQUE NOT NULL DEFAULT '__global__',
  last_caller_id VARCHAR(36),
  FOREIGN KEY (last_caller_id) REFERENCES callers(id) ON DELETE SET NULL
);

-- 4. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(36) PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(36) PRIMARY KEY,
  caller_name VARCHAR(255) NOT NULL,
  date DATE DEFAULT (CURRENT_DATE),
  status VARCHAR(50) DEFAULT 'Present',
  UNIQUE KEY unique_caller_date (caller_name, date)
);

-- 6. Indexes for query performance
CREATE INDEX idx_leads_state ON leads(state);
CREATE INDEX idx_leads_assigned ON leads(assigned_caller_id);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_leads_sheet_row ON leads(sheet_row_number);
