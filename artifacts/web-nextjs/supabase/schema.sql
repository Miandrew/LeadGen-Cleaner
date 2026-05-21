-- CommercialCleaningNearMe.com — Full Schema
-- Run this in: Supabase → SQL Editor → New Query → Run

-- ─── Companies ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text NOT NULL,
  name_for_emails         text,
  slug                    text UNIQUE,
  place_id                text UNIQUE,
  reviews_id              text,
  address                 text,
  street                  text,
  city                    text,
  state                   text,
  zip                     text,
  city_state              text,
  latitude                float,
  longitude               float,
  phone                   text,
  email                   text,
  website                 text,
  domain                  text,
  google_maps_url         text,
  rating                  float,
  review_count            int DEFAULT 0,
  review_score_label      text,
  photo                   text,
  image_urls              text[],
  logo_url                text,
  owner_id                text,
  owner_title             text,
  business_status         text,
  working_hours           text,
  source                  text,
  -- Social / contact intel
  company_linkedin        text,
  company_facebook        text,
  company_instagram       text,
  company_twitter         text,
  company_youtube         text,
  full_name               text,
  first_name              text,
  last_name               text,
  title                   text,
  contact_phone           text,
  contact_linkedin        text,
  -- Website intel
  website_title           text,
  website_description     text,
  website_generator       text,
  website_has_gtm         boolean,
  website_has_fb_pixel    boolean,
  -- Services & categorization
  services                text[],
  services_clean          text,
  primary_service         text,
  tags                    text,
  industries_served       text[],
  specialties             text[],
  trust_signals           text[],
  certifications          text[],
  service_areas           text[],
  -- Content
  description             text,
  short_description       text,
  about                   text,
  seo_title               text,
  seo_description         text,
  -- Business info
  years_in_business       int,
  employee_count          text,
  -- Flags
  claimed                 boolean DEFAULT false,
  active                  boolean DEFAULT true,
  do_not_email            boolean DEFAULT false,
  created_at              timestamp DEFAULT now()
);

-- ─── Reviews ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid REFERENCES companies(id) ON DELETE CASCADE,
  author      text,
  rating      float,
  review_text text,
  review_date text,
  source      text DEFAULT 'google',
  created_at  timestamp DEFAULT now()
);

-- ─── Leads ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type          text,
  city                  text,
  state                 text,
  contact_name          text,
  contact_email         text,
  contact_phone         text,
  business_name         text,
  building_type         text,
  building_size         text,
  frequency             text,
  message               text,
  selected_company_ids  uuid[],
  status                text DEFAULT 'open',
  lead_type             text, -- 'exclusive' | 'semi-exclusive' | 'shared'
  created_at            timestamp DEFAULT now()
);

-- ─── Lead Purchases ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_purchases (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           uuid REFERENCES leads(id),
  company_id        uuid REFERENCES companies(id),
  amount_paid       float DEFAULT 35,
  stripe_payment_id text UNIQUE,
  purchased_at      timestamp DEFAULT now()
);

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text UNIQUE,
  company_id          uuid REFERENCES companies(id),
  role                text DEFAULT 'company',
  stripe_customer_id  text,
  subscription_status text,
  subscription_tier   text,
  leads_remaining     int DEFAULT 0,
  created_at          timestamp DEFAULT now()
);

-- ─── Company Onboarding ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_onboarding (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            uuid REFERENCES companies(id),
  how_getting_clients   text[],
  biggest_challenge     text,
  new_clients_per_month text,
  marketing_budget      text,
  segment               text,
  contacted             boolean DEFAULT false,
  created_at            timestamp DEFAULT now()
);

-- ─── Featured Listings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS featured_listings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              uuid REFERENCES companies(id),
  placement_type          text,
  state                   text,
  city                    text,
  stripe_subscription_id  text,
  active                  boolean DEFAULT true,
  starts_at               timestamp,
  ends_at                 timestamp
);

-- ─── Email Sequences ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_sequences (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     uuid REFERENCES companies(id),
  sequence_name  text,
  sent_at        timestamp DEFAULT now(),
  UNIQUE(company_id, sequence_name)
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS companies_city_idx     ON companies(city);
CREATE INDEX IF NOT EXISTS companies_state_idx    ON companies(state);
CREATE INDEX IF NOT EXISTS companies_rating_idx   ON companies(rating);
CREATE INDEX IF NOT EXISTS companies_claimed_idx  ON companies(claimed);
CREATE INDEX IF NOT EXISTS companies_active_idx   ON companies(active);
CREATE INDEX IF NOT EXISTS leads_status_idx       ON leads(status);
CREATE INDEX IF NOT EXISTS leads_email_idx        ON leads(contact_email);
CREATE INDEX IF NOT EXISTS leads_created_idx      ON leads(created_at);
CREATE INDEX IF NOT EXISTS lead_purchases_stripe  ON lead_purchases(stripe_payment_id);

-- ─── Helper Functions ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION decrement_leads(p_company_id uuid)
RETURNS int AS $$
DECLARE
  current_remaining int;
BEGIN
  SELECT leads_remaining INTO current_remaining FROM users WHERE company_id = p_company_id;
  IF current_remaining > 0 THEN
    UPDATE users SET leads_remaining = leads_remaining - 1 WHERE company_id = p_company_id;
    RETURN current_remaining - 1;
  ELSE
    RETURN -1;
  END IF;
END;
$$ LANGUAGE plpgsql;
