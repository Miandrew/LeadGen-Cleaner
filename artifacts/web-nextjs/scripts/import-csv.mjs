import { createClient } from '@supabase/supabase-js'
import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import { fileURLToPath } from 'url'
import path from 'path'
import { readFileSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load env from .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || SUPABASE_URL.includes('your_')) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const CATEGORY_TO_SERVICES = {
  'janitorial service': ['Janitorial Services', 'Office Cleaning'],
  'cleaning service': ['General Cleaning', 'Office Cleaning'],
  'commercial cleaning': ['Commercial Cleaning', 'Office Cleaning'],
  'house cleaning service': ['Residential Cleaning'],
  'carpet cleaning service': ['Carpet Cleaning'],
  'window cleaning service': ['Window Cleaning'],
  'pressure washing service': ['Pressure Washing'],
  'floor refinishing service': ['Floor Care'],
  'maid service': ['Residential Cleaning', 'General Cleaning'],
  'cleaners': ['General Cleaning'],
  'building cleaning service': ['Building Cleaning', 'Janitorial Services'],
  'industrial cleaning service': ['Industrial Cleaning'],
  'property management company': ['Property Management'],
  'servicio de conserjería': ['Janitorial Services'],
}

function categoryToServices(category) {
  if (!category) return ['General Cleaning']
  const lower = category.toLowerCase()
  for (const [key, services] of Object.entries(CATEGORY_TO_SERVICES)) {
    if (lower.includes(key)) return services
  }
  if (lower.includes('commercial')) return ['Commercial Cleaning', 'Office Cleaning']
  if (lower.includes('janitorial')) return ['Janitorial Services']
  if (lower.includes('carpet')) return ['Carpet Cleaning']
  if (lower.includes('window')) return ['Window Cleaning']
  if (lower.includes('floor')) return ['Floor Care']
  if (lower.includes('pressure') || lower.includes('power wash')) return ['Pressure Washing']
  return ['Commercial Cleaning']
}

function slugify(name, city, state) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
  const location = `${(city || '').toLowerCase().replace(/\s+/g, '-')}-${(state || '').toLowerCase()}`
  return `${base}-${location}`.replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function cleanPhone(phone) {
  if (!phone) return null
  return phone.replace(/[^\d+\-() ]/g, '').trim() || null
}

function parseRating(rating) {
  const n = parseFloat(rating)
  return isNaN(n) ? null : Math.min(5, Math.max(0, n))
}

function parseReviewCount(reviews) {
  const n = parseInt(reviews)
  return isNaN(n) ? 0 : n
}

async function runImport() {
  const csvPath = path.join(__dirname, '..', '..', '..', 'attached_assets', 'master_enriched_final_clean_(1)_1779205830615.csv')

  console.log('Starting import from:', csvPath)
  console.log('Supabase URL:', SUPABASE_URL)

  const slugsSeen = new Set()
  const BATCH_SIZE = 100
  let batch = []
  let total = 0
  let inserted = 0
  let skipped = 0

  function makeSlugUnique(slug) {
    if (!slugsSeen.has(slug)) {
      slugsSeen.add(slug)
      return slug
    }
    let i = 2
    while (slugsSeen.has(`${slug}-${i}`)) i++
    const unique = `${slug}-${i}`
    slugsSeen.add(unique)
    return unique
  }

  async function flushBatch() {
    if (batch.length === 0) return
    const { error, data } = await supabase
      .from('companies')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false })
    if (error) {
      console.error('Batch error:', error.message)
      skipped += batch.length
    } else {
      inserted += batch.length
    }
    batch = []
  }

  await new Promise((resolve, reject) => {
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true,
    })

    parser.on('readable', async function () {
      let record
      while ((record = this.read()) !== null) {
        total++

        // Skip if no name or state
        if (!record.name || !record.state) { skipped++; continue }
        // Skip non-US or empty state
        if (record.state.length !== 2) { skipped++; continue }
        // Skip if not operational
        if (record.business_status && record.business_status !== 'OPERATIONAL') { skipped++; continue }

        const slug = makeSlugUnique(slugify(record.name, record.city, record.state))
        const services = categoryToServices(record.category)

        // Extract description: prefer description field, fall back to short_description
        let description = record.description || record.short_description || null
        if (description && description.length > 500) {
          description = description.slice(0, 500)
        }

        const company = {
          name: record.name.slice(0, 200),
          slug,
          website: record.website || null,
          phone: cleanPhone(record.phone),
          address: record.address || record.street || null,
          city: record.city || null,
          state: record.state.toUpperCase(),
          services,
          rating: parseRating(record.rating),
          review_count: parseReviewCount(record.reviews),
          description,
          place_id: record.place_id || null,
          image_urls: record.photo ? [record.photo] : [],
          logo_url: null,
          claimed: false,
          active: true,
        }

        batch.push(company)

        if (batch.length >= BATCH_SIZE) {
          this.pause()
          await flushBatch()
          if (total % 500 === 0) console.log(`Progress: ${total} processed, ${inserted} inserted, ${skipped} skipped`)
          this.resume()
        }
      }
    })

    parser.on('end', async () => {
      await flushBatch()
      resolve()
    })

    parser.on('error', reject)

    createReadStream(csvPath).pipe(parser)
  })

  console.log('\n=== Import Complete ===')
  console.log(`Total rows:  ${total}`)
  console.log(`Inserted:    ${inserted}`)
  console.log(`Skipped:     ${skipped}`)

  // Verify
  const { count } = await supabase.from('companies').select('*', { count: 'exact', head: true })
  console.log(`DB total:    ${count} companies`)
}

runImport().catch(console.error)
