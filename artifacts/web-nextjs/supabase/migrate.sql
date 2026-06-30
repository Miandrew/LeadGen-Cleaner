-- Migration: Add all missing columns to companies table
-- Run this in: Supabase → SQL Editor → New Query → Run

ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS zip text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city_state text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS latitude float;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS longitude float;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS domain text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS services text[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS rating float;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS review_count int DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS review_score_label text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS about text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS place_id text UNIQUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS reviews_id text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS image_urls text[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS photo text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_id text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner_title text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS business_status text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS working_hours text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_linkedin text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_facebook text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_instagram text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_twitter text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_youtube text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_linkedin text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_title text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_description text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_generator text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_has_gtm boolean;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_has_fb_pixel boolean;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS services_clean text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS primary_service text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tags text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS name_for_emails text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industries_served text[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS specialties text[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trust_signals text[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS certifications text[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS service_areas text[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS years_in_business int;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS claimed boolean DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS do_not_email boolean DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

-- Other tables
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  author text, rating float, review_text text, review_date text,
  source text DEFAULT 'google', created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text, city text, state text,
  contact_name text, contact_email text, contact_phone text,
  business_name text, building_type text, building_size text,
  frequency text, message text, selected_company_ids uuid[],
  status text DEFAULT 'open', created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  company_id uuid REFERENCES companies(id),
  amount_paid float DEFAULT 35,
  stripe_payment_id text UNIQUE,
  purchased_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE, company_id uuid REFERENCES companies(id),
  role text DEFAULT 'company', stripe_customer_id text,
  subscription_status text, subscription_tier text,
  leads_remaining int DEFAULT 0, created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  lead_source text[], biggest_challenge text,
  active_accounts text, growth_capacity text,
  segment text, contacted boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Onboarding survey rename (existing DBs) — guarded so it is safe on fresh DBs too
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_onboarding' AND column_name = 'how_getting_clients') THEN
    ALTER TABLE company_onboarding RENAME COLUMN how_getting_clients TO lead_source;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_onboarding' AND column_name = 'new_clients_per_month') THEN
    ALTER TABLE company_onboarding RENAME COLUMN new_clients_per_month TO active_accounts;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_onboarding' AND column_name = 'marketing_budget') THEN
    ALTER TABLE company_onboarding RENAME COLUMN marketing_budget TO growth_capacity;
  END IF;
END $$;
ALTER TABLE company_onboarding ADD COLUMN IF NOT EXISTS lead_source text[];
ALTER TABLE company_onboarding ADD COLUMN IF NOT EXISTS active_accounts text;
ALTER TABLE company_onboarding ADD COLUMN IF NOT EXISTS growth_capacity text;

-- Company-level intelligence flags (independent of HOT/WARM/NURTURE segment)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cashflow_flag boolean DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS acquisition_flag boolean DEFAULT false;

-- Self-serve "Request This Lead" (no payment)
CREATE TABLE IF NOT EXISTS lead_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  company_id uuid REFERENCES companies(id),
  status text DEFAULT 'requested',
  requested_at timestamp DEFAULT now(),
  UNIQUE(lead_id, company_id)
);

CREATE TABLE IF NOT EXISTS featured_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  placement_type text, state text, city text,
  stripe_subscription_id text, active boolean DEFAULT true,
  starts_at timestamp, ends_at timestamp
);

CREATE TABLE IF NOT EXISTS email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  sequence_name text, sent_at timestamp DEFAULT now(),
  UNIQUE(company_id, sequence_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS companies_city_idx    ON companies(city);
CREATE INDEX IF NOT EXISTS companies_state_idx   ON companies(state);
CREATE INDEX IF NOT EXISTS companies_rating_idx  ON companies(rating);
CREATE INDEX IF NOT EXISTS companies_claimed_idx ON companies(claimed);
CREATE INDEX IF NOT EXISTS companies_active_idx  ON companies(active);
CREATE INDEX IF NOT EXISTS leads_status_idx      ON leads(status);
CREATE INDEX IF NOT EXISTS leads_email_idx       ON leads(contact_email);

-- Helper function
CREATE OR REPLACE FUNCTION decrement_leads(p_company_id uuid)
RETURNS int AS $$
DECLARE current_remaining int;
BEGIN
  SELECT leads_remaining INTO current_remaining FROM users WHERE company_id = p_company_id;
  IF current_remaining > 0 THEN
    UPDATE users SET leads_remaining = leads_remaining - 1 WHERE company_id = p_company_id;
    RETURN current_remaining - 1;
  ELSE RETURN -1;
  END IF;
END;
$$ LANGUAGE plpgsql;
