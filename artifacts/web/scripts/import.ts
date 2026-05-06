import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateSlug(name: string, city: string): string {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function importCSV(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))

  let inserted = 0
  let skipped = 0

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] || '' })

    if (!row.name && !row.city) { skipped++; continue }

    const slug = generateSlug(row.name || '', row.city || '')

    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) { skipped++; continue }

    const services = row.services_clean
      ? row.services_clean.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const { error } = await supabase
      .from('companies')
      .insert({
        name: row.name,
        slug,
        city: row.city,
        state: row.state,
        phone: row.phone,
        email: row.email,
        website: row.website,
        address: row.address,
        rating: parseFloat(row.rating) || null,
        review_count: parseInt(row.review_count) || 0,
        place_id: row.place_id,
        services,
        active: true,
      })

    if (error) { console.error(`Error inserting ${row.name}:`, error); skipped++; continue }

    inserted++
    if (inserted % 100 === 0) console.log(`Inserted: ${inserted}`)
  }

  console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}`)
}

importCSV(process.argv[2] || 'master_clean.csv')
