// CSV Import Script
// ─────────────────────────────────────────────────────
// Run:   npx tsx scripts/import.ts
// File:  master_enriched_final_clean.csv (drag into Replit file panel first)
// ─────────────────────────────────────────────────────

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import Papa from 'papaparse'
import { createClient } from '@supabase/supabase-js'

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || SUPABASE_URL.includes('your_')) {
  console.error('Missing or placeholder: NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}
if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('your_')) {
  console.error('Missing or placeholder: SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const CSV_FILE = path.resolve(
  __dirname, '..', '..', '..', 'attached_assets',
  'master_final_1779300929786.csv'
)
const BATCH_SIZE = 50
const BATCH_DELAY_MS = 100

// ─── Slug generator (collision-proof via place_id suffix) ─────────────────────

function generateSlug(name: string, city: string | null, state: string | null, placeId: string | null): string {
  const base = [name, city, state]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60)
  // Append last 6 chars of place_id for guaranteed uniqueness
  const suffix = placeId ? placeId.slice(-6).toLowerCase() : Math.random().toString(36).slice(2, 8)
  return `${base}-${suffix}`.replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// ─── Cleaning helpers ────────────────────────────────────────────────────────

const NULL_STRINGS = new Set(['', 'nan', 'NaN', 'None', 'null', 'undefined'])

function clean(val: unknown): string | null {
  if (val === null || val === undefined) return null
  const s = String(val).trim()
  return NULL_STRINGS.has(s) ? null : s
}

function parseFloatSafe(val: unknown): number | null {
  const s = clean(val)
  if (s === null) return null
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

function parseIntSafe(val: unknown): number | null {
  const s = clean(val)
  if (s === null) return null
  const n = parseInt(s, 10)
  return isNaN(n) || n <= 0 ? null : n
}

function parseRating(val: unknown): number | null {
  const n = parseFloatSafe(val)
  if (n === null) return null
  return n < 0 || n > 5 ? null : n
}

function parseLatitude(val: unknown): number | null {
  const n = parseFloatSafe(val)
  if (n === null) return null
  return n < -90 || n > 90 ? null : n
}

function parseLongitude(val: unknown): number | null {
  const n = parseFloatSafe(val)
  if (n === null) return null
  return n < -180 || n > 180 ? null : n
}

function parseBoolean(val: unknown): boolean | null {
  const s = clean(val)
  if (s === null) return null
  if (s === 'true' || s === '1') return true
  if (s === 'false' || s === '0') return false
  return null
}

function parseArray(val: unknown): string[] | null {
  const s = clean(val)
  if (s === null) return null
  const arr = s.split(', ').map((x: string) => x.trim()).filter((x: string) => x.length > 0)
  return arr.length === 0 ? null : arr
}

// ─── Raw CSV row type ────────────────────────────────────────────────────────

interface CsvRow {
  name: string
  name_for_emails: string
  slug: string
  place_id: string
  reviews_id: string
  address: string
  street: string
  city: string
  state: string
  latitude: string
  longitude: string
  city_state: string
  phone: string
  email: string
  website: string
  domain: string
  google_maps_url: string
  rating: string
  reviews: string
  review_score_label: string
  photo: string
  owner_id: string
  owner_title: string
  business_status: string
  working_hours_csv_compatible: string
  source: string
  company_linkedin: string
  company_facebook: string
  company_instagram: string
  company_x: string
  company_youtube: string
  full_name: string
  first_name: string
  last_name: string
  title: string
  contact_phone: string
  contact_linkedin: string
  website_title: string
  website_description: string
  website_generator: string
  website_has_gtm: string
  website_has_fb_pixel: string
  services_clean: string
  primary_service: string
  tags: string
  description: string
  short_description: string
  about: string
  seo_title: string
  seo_description: string
  industries_served: string
  specialties: string
  trust_signals: string
  certifications: string
  service_areas: string
  years_in_business: string
  [key: string]: string
}

// ─── DB insert type ──────────────────────────────────────────────────────────

interface CompanyInsert {
  name: string
  name_for_emails: string | null
  slug: string | null
  place_id: string | null
  reviews_id: string | null
  address: string | null
  street: string | null
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  city_state: string | null
  phone: string | null
  email: string | null
  website: string | null
  domain: string | null
  google_maps_url: string | null
  rating: number | null
  review_count: number | null
  review_score_label: string | null
  photo: string | null
  owner_id: string | null
  owner_title: string | null
  business_status: string | null
  working_hours: string | null
  source: string | null
  company_linkedin: string | null
  company_facebook: string | null
  company_instagram: string | null
  company_twitter: string | null
  company_youtube: string | null
  full_name: string | null
  first_name: string | null
  last_name: string | null
  title: string | null
  contact_phone: string | null
  contact_linkedin: string | null
  website_title: string | null
  website_description: string | null
  website_generator: string | null
  website_has_gtm: boolean | null
  website_has_fb_pixel: boolean | null
  services_clean: string | null
  primary_service: string | null
  tags: string | null
  description: string | null
  short_description: string | null
  about: string | null
  seo_title: string | null
  seo_description: string | null
  industries_served: string[] | null
  specialties: string[] | null
  trust_signals: string[] | null
  certifications: string[] | null
  service_areas: string[] | null
  services: string[] | null
  years_in_business: number | null
}

// ─── Row mapper ──────────────────────────────────────────────────────────────

function mapRow(row: CsvRow): CompanyInsert | null {
  const name = clean(row.name)
  if (!name) return null
  if (clean(row.business_status) !== 'OPERATIONAL') return null

  const placeId = clean(row.place_id)
  const city = clean(row.city)
  const state = clean(row.state)

  return {
    name,
    name_for_emails:      clean(row.name_for_emails),
    slug:                 generateSlug(name, city, state, placeId),
    place_id:             placeId,
    reviews_id:           clean(row.reviews_id),
    address:              clean(row.address),
    street:               clean(row.street),
    city:                 clean(row.city),
    state:                clean(row.state),
    latitude:             parseLatitude(row.latitude),
    longitude:            parseLongitude(row.longitude),
    city_state:           clean(row.city_state),
    phone:                clean(row.phone),
    email:                clean(row.email),
    website:              clean(row.website),
    domain:               clean(row.domain),
    google_maps_url:      clean(row.google_maps_url),
    rating:               parseRating(row.rating),
    review_count:         parseIntSafe(row.reviews),
    review_score_label:   clean(row.review_score_label),
    photo:                clean(row.photo),
    owner_id:             clean(row.owner_id),
    owner_title:          clean(row.owner_title),
    business_status:      clean(row.business_status),
    working_hours:        clean(row.working_hours_csv_compatible),
    source:               clean(row.source),
    company_linkedin:     clean(row.company_linkedin),
    company_facebook:     clean(row.company_facebook),
    company_instagram:    clean(row.company_instagram),
    company_twitter:      clean(row.company_x),
    company_youtube:      clean(row.company_youtube),
    full_name:            clean(row.full_name),
    first_name:           clean(row.first_name),
    last_name:            clean(row.last_name),
    title:                clean(row.title),
    contact_phone:        clean(row.contact_phone),
    contact_linkedin:     clean(row.contact_linkedin),
    website_title:        clean(row.website_title),
    website_description:  clean(row.website_description),
    website_generator:    clean(row.website_generator),
    website_has_gtm:      parseBoolean(row.website_has_gtm),
    website_has_fb_pixel: parseBoolean(row.website_has_fb_pixel),
    services_clean:       clean(row.services_clean),
    primary_service:      clean(row.primary_service),
    tags:                 clean(row.tags),
    description:          clean(row.description),
    short_description:    clean(row.short_description),
    about:                clean(row.about),
    seo_title:            clean(row.seo_title),
    seo_description:      clean(row.seo_description),
    industries_served:    parseArray(row.industries_served),
    specialties:          parseArray(row.specialties),
    trust_signals:        parseArray(row.trust_signals),
    certifications:       parseArray(row.certifications),
    service_areas:        parseArray(row.service_areas),
    services:             parseArray(row.services_clean),
    years_in_business:    parseIntSafe(row.years_in_business),
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════')
  console.log('  Commercial Cleaning Directory — CSV Import')
  console.log(`  File:     ${path.basename(CSV_FILE)}`)
  console.log(`  Database: ${SUPABASE_URL}`)
  console.log('  ───────────────────────────────────────────────')
  console.log('  Starting import...')
  console.log('═══════════════════════════════════════════════════')

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`\nCSV file not found:\n  ${CSV_FILE}`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8')

  const result = Papa.parse<CsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  const allRows = result.data
  console.log(`\nParsed ${allRows.length} rows from CSV.\n`)

  // Map + filter
  const mapped: CompanyInsert[] = []
  let skipped = 0

  for (const row of allRows) {
    const company = mapRow(row)
    if (company) {
      mapped.push(company)
    } else {
      skipped++
    }
  }

  const total = mapped.length
  let inserted = 0
  let batchErrors = 0

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = mapped.slice(i, i + BATCH_SIZE)
    const remaining = Math.max(0, total - i - batch.length)

    const { error } = await supabase
      .from('companies')
      .upsert(batch, { onConflict: 'place_id' })

    if (error) {
      batchErrors++
      console.error(`BATCH ERROR at row ${i}: ${error.message}`)
    } else {
      inserted += batch.length
      console.log(`Inserted: ${batch.length} | Total: ${inserted} | Remaining: ${remaining}`)
    }

    if (i + BATCH_SIZE < total) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  Import complete')
  console.log(`  Inserted/updated:   ${inserted}`)
  console.log(`  Skipped:            ${skipped}`)
  console.log(`  Batch errors:       ${batchErrors}`)
  console.log('  ───────────────────────────────────────────────')
  console.log('  Go to Supabase → Table Editor → companies')
  console.log('  to verify your data.')
  console.log('═══════════════════════════════════════════════════')
}

main().catch((err: Error) => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
