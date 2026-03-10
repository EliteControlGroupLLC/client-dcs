-- Leads table for capturing customer inquiries
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  property_type TEXT,
  source TEXT DEFAULT 'website',
  source_page TEXT,
  status TEXT DEFAULT 'new',
  message TEXT,
  internal_notes TEXT,
  adu_type TEXT,
  adu_size_sqft INTEGER,
  adu_bedrooms INTEGER,
  adu_bathrooms DECIMAL(2,1),
  estimated_budget DECIMAL(12,2),
  timeline TEXT,
  financing_interest BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit leads" ON leads FOR INSERT WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
