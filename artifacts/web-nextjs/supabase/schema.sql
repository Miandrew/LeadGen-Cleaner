create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  website text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  zip text,
  services text[],
  rating float,
  review_count int default 0,
  description text,
  place_id text,
  image_urls text[],
  logo_url text,
  claimed boolean default false,
  active boolean default true,
  do_not_email boolean default false,
  years_in_business int,
  certifications text[],
  employee_count text,
  created_at timestamp default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  author text,
  rating float,
  review_text text,
  review_date text,
  source text default 'google',
  created_at timestamp default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  service_type text,
  city text,
  state text,
  contact_name text,
  contact_email text,
  contact_phone text,
  business_name text,
  building_type text,
  building_size text,
  frequency text,
  message text,
  selected_company_ids uuid[],
  status text default 'open',
  created_at timestamp default now()
);

create table lead_purchases (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  company_id uuid references companies(id),
  amount_paid float default 35,
  stripe_payment_id text unique,
  purchased_at timestamp default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  company_id uuid references companies(id),
  role text default 'company',
  stripe_customer_id text,
  subscription_status text,
  subscription_tier text,
  leads_remaining int default 0,
  created_at timestamp default now()
);

create table company_onboarding (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  how_getting_clients text[],
  biggest_challenge text,
  new_clients_per_month text,
  marketing_budget text,
  segment text,
  contacted boolean default false,
  created_at timestamp default now()
);

create table featured_listings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  placement_type text,
  state text,
  city text,
  stripe_subscription_id text,
  active boolean default true,
  starts_at timestamp,
  ends_at timestamp
);

create table email_sequences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  sequence_name text,
  sent_at timestamp default now(),
  unique(company_id, sequence_name)
);

create index on companies(city);
create index on companies(state);
create index on companies(rating);
create index on companies(claimed);
create index on leads(status);
create index on leads(contact_email);
create index on leads(created_at);
create index on lead_purchases(stripe_payment_id);

create or replace function decrement_leads(p_company_id uuid)
returns int as $$
declare
  current_remaining int;
begin
  select leads_remaining into current_remaining
  from users where company_id = p_company_id;
  if current_remaining > 0 then
    update users set leads_remaining = leads_remaining - 1
    where company_id = p_company_id;
    return current_remaining - 1;
  else
    return -1;
  end if;
end;
$$ language plpgsql;
