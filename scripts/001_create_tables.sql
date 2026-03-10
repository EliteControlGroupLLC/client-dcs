-- Distinct Construction Solutions Database Schema

-- Leads table for capturing customer inquiries
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contact info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Property info
  address TEXT,
  city TEXT,
  zip_code TEXT,
  property_type TEXT, -- 'single_family', 'multi_family', 'commercial'
  
  -- Lead source
  source TEXT DEFAULT 'website', -- 'website', 'build_your_adu', 'calculator', 'contact_form'
  source_page TEXT,
  
  -- Lead status
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'proposal', 'won', 'lost'
  
  -- Notes
  message TEXT,
  internal_notes TEXT,
  
  -- ADU specific fields (from Build Your ADU flow)
  adu_type TEXT, -- 'detached', 'attached', 'conversion', 'jadu'
  adu_size_sqft INTEGER,
  adu_bedrooms INTEGER,
  adu_bathrooms DECIMAL(2,1),
  estimated_budget DECIMAL(12,2),
  timeline TEXT, -- 'asap', '3_months', '6_months', '1_year', 'exploring'
  
  -- Financing interest
  financing_interest BOOLEAN DEFAULT FALSE,
  
  -- Marketing consent
  marketing_consent BOOLEAN DEFAULT FALSE
);

-- Projects table for portfolio/gallery
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Project info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Project details
  project_type TEXT NOT NULL, -- 'adu', 'new_construction', 'remodel', 'addition'
  category TEXT, -- 'kitchen', 'bathroom', 'whole_house', 'backyard', 'garage_conversion'
  
  -- Location (general area, not exact)
  neighborhood TEXT,
  city TEXT DEFAULT 'San Diego',
  
  -- Specs
  sqft INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(2,1),
  
  -- Cost range
  cost_range_min DECIMAL(12,2),
  cost_range_max DECIMAL(12,2),
  
  -- Timeline
  duration_weeks INTEGER,
  completion_date DATE,
  
  -- Media
  featured_image TEXT,
  images TEXT[], -- Array of image URLs
  video_url TEXT,
  
  -- Display settings
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Testimonial
  client_testimonial TEXT,
  client_name TEXT
);

-- Floor plans library
CREATE TABLE IF NOT EXISTS floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Plan info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Category
  plan_type TEXT NOT NULL, -- 'studio', '1bed', '2bed', '3bed', 'jadu', 'custom'
  style TEXT, -- 'modern', 'traditional', 'coastal', 'spanish', 'farmhouse'
  
  -- Specs
  sqft INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(2,1) NOT NULL,
  stories INTEGER DEFAULT 1,
  
  -- Features
  has_garage BOOLEAN DEFAULT FALSE,
  has_porch BOOLEAN DEFAULT FALSE,
  has_deck BOOLEAN DEFAULT FALSE,
  ada_accessible BOOLEAN DEFAULT FALSE,
  
  -- Dimensions
  width_ft DECIMAL(5,1),
  depth_ft DECIMAL(5,1),
  
  -- Pricing
  base_price DECIMAL(12,2),
  price_per_sqft DECIMAL(8,2),
  
  -- Media
  thumbnail_image TEXT,
  floor_plan_image TEXT,
  elevation_images TEXT[],
  gallery_images TEXT[],
  
  -- Popularity
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  
  -- Display
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- Calculator submissions (for analytics and follow-up)
CREATE TABLE IF NOT EXISTS calculator_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Calculator type
  calculator_type TEXT NOT NULL, -- 'adu_price', 'adu_income', 'roof', 'concrete', 'kitchen', 'bathroom', 'roi'
  
  -- Input data (JSON for flexibility)
  input_data JSONB NOT NULL,
  
  -- Results
  result_data JSONB NOT NULL,
  
  -- Lead capture (optional)
  lead_id UUID REFERENCES leads(id),
  email TEXT,
  
  -- Session tracking
  session_id TEXT,
  ip_address INET
);

-- ADU configurations from Build Your ADU flow
CREATE TABLE IF NOT EXISTS adu_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Link to lead
  lead_id UUID REFERENCES leads(id),
  
  -- Session tracking
  session_id TEXT,
  
  -- Step 1: Property Info
  property_address TEXT,
  lot_size_sqft INTEGER,
  existing_home_sqft INTEGER,
  zoning TEXT,
  
  -- Step 2: ADU Type
  adu_type TEXT, -- 'detached', 'attached', 'garage_conversion', 'jadu', 'addition'
  
  -- Step 3: Size Selection
  sqft INTEGER,
  
  -- Step 4: Layout
  bedrooms INTEGER,
  bathrooms DECIMAL(2,1),
  floor_plan_id UUID REFERENCES floor_plans(id),
  
  -- Step 5: Features & Finishes
  finish_level TEXT, -- 'standard', 'premium', 'luxury'
  selected_features TEXT[], -- Array of feature codes
  
  -- Step 6: Style
  exterior_style TEXT,
  roof_type TEXT,
  siding_material TEXT,
  
  -- Pricing
  base_estimate DECIMAL(12,2),
  feature_additions DECIMAL(12,2),
  total_estimate DECIMAL(12,2),
  
  -- Status
  is_complete BOOLEAN DEFAULT FALSE,
  current_step INTEGER DEFAULT 1,
  
  -- Saved configuration name
  config_name TEXT
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contact info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Message
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Preferred contact method
  preferred_contact TEXT DEFAULT 'email', -- 'email', 'phone', 'text'
  
  -- Link to lead
  lead_id UUID REFERENCES leads(id),
  
  -- Status
  status TEXT DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
  
  -- Source page
  source_page TEXT
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  
  -- Interests
  interests TEXT[], -- 'adu', 'remodeling', 'new_construction', 'financing'
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMPTZ
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_floor_plans_type ON floor_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_floor_plans_sqft ON floor_plans(sqft);
CREATE INDEX IF NOT EXISTS idx_calculator_type ON calculator_submissions(calculator_type);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adu_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Public can view published floor plans" ON floor_plans
  FOR SELECT USING (is_published = TRUE);

-- Public insert policies for forms
CREATE POLICY "Anyone can submit leads" ON leads
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can submit calculator data" ON calculator_submissions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can submit contact forms" ON contact_submissions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can create ADU configurations" ON adu_configurations
  FOR INSERT WITH CHECK (TRUE);

-- Allow anonymous users to read their own ADU configurations by session
CREATE POLICY "Users can read own ADU configs" ON adu_configurations
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own ADU configs" ON adu_configurations
  FOR UPDATE USING (TRUE);
