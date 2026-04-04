/**
 * Seeds Supabase with demo admins, vendors A–D, North Square shops, and full menus.
 * Data lives in DB after run — app reads from Supabase only.
 *
 * Prereqs (project root .env):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (preferred) or VITE_SUPABASE_SERVICE_KEY — service role; never use VITE_ prefix in production
 *
 * Run: npm run seed:demo
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SEED_DATA = join(__dirname, 'seed-data')

const PASSWORD = 'INDIAN@22162'

const USER_ROWS = [
  { email: 'super.admin@vit-chennai.seed', role: 'super_admin', full_name: 'Super Admin' },
  { email: 'college.admin@vit-chennai.seed', role: 'college_admin', full_name: 'College Admin' },
  { email: 'vendor.a@vit-chennai.seed', role: 'vendor', full_name: 'Vendor A' },
  { email: 'vendor.b@vit-chennai.seed', role: 'vendor', full_name: 'Vendor B' },
  { email: 'vendor.c@vit-chennai.seed', role: 'vendor', full_name: 'Vendor C' },
  { email: 'vendor.d@vit-chennai.seed', role: 'vendor', full_name: 'Vendor D' },
]

/** Vendor A → Alpha, B → Hot & Cool, C → Georgia, D → Sri's */
const VENDOR_MENUS = [
  { email: 'vendor.a@vit-chennai.seed', file: 'alpha-toobasis-shawarma.json' },
  { email: 'vendor.b@vit-chennai.seed', file: 'hot-cool.json' },
  { email: 'vendor.c@vit-chennai.seed', file: 'georgia.json' },
  { email: 'vendor.d@vit-chennai.seed', file: 'sris.json' },
]

function loadEnv() {
  const envPath = join(ROOT, '.env')
  const raw = readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return env
}

function expandItemRows(item) {
  if (item.half_price != null && item.full_price != null) {
    return [
      { name: `${item.name} (Half)`, price: Number(item.half_price) },
      { name: `${item.name} (Full)`, price: Number(item.full_price) },
    ]
  }
  if (typeof item.price === 'number') {
    return [{ name: item.name, price: Number(item.price) }]
  }
  console.warn('Skipping item (no usable price):', item)
  return []
}

function defaultEmoji(categoryName) {
  const m = {
    Shawarma: '🌯',
    Plates: '🍽️',
    'Rolls & Wraps': '🌯',
    'Add-ons': '➕',
    Beverages: '🥤',
    Sandwiches: '🥪',
    Maggi: '🍜',
    Rolls: '🌯',
    Burgers: '🍔',
    Omelette: '🍳',
    Snacks: '🥟',
    Juices: '🧃',
    Milkshakes: '🥤',
    Lassi: '🥛',
    'Cold Drinks': '❄️',
    Lunch: '🍛',
    'Egg Items': '🥚',
    'Fast Food': '🍟',
    'Chaat Items': '🥙',
    'Pasta Menu': '🍝',
    'Italian Specials': '🍕',
    Fries: '🍟',
    Drinks: '🥤',
    Desserts: '🍨',
  }
  return m[categoryName] || '🍴'
}

async function ensureAuthUser(supabase, email, password, fullName) {
  const { data: page, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (listErr) throw listErr
  const found = page?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (found) {
    console.log(`  User exists: ${email}`)
    return found.id
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error) throw error
  console.log(`  Created user: ${email}`)
  return data.user.id
}

async function upsertProfile(supabase, userId, row) {
  const base = {
    id: userId,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    is_active: row.is_active !== false,
  }
  const { error } = await supabase.from('profiles').upsert(base, { onConflict: 'id' })
  if (error) throw error
}

async function findOrCreateLocation(supabase, name) {
  const { data: ex, error: selErr } = await supabase
    .from('locations')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  if (selErr) throw selErr
  if (ex?.id) return ex.id

  const { data, error } = await supabase.from('locations').insert({ name }).select('id').single()
  if (error) throw error
  return data.id
}

async function findOrCreateCategory(supabase, name, emoji) {
  const { data: ex, error: selErr } = await supabase
    .from('categories')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  if (selErr) throw selErr
  if (ex?.id) return ex.id

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, emoji })
    .select('id')
    .single()
  if (error) {
    const { data: ex2 } = await supabase.from('categories').select('id').eq('name', name).maybeSingle()
    if (ex2?.id) return ex2.id
    throw error
  }
  return data.id
}

async function upsertShopForOwner(supabase, { name, ownerId, locationId, outletCategoryId }) {
  const { data: ex, error: selErr } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', ownerId)
    .maybeSingle()
  if (selErr) throw selErr

  const row = {
    name,
    owner_id: ownerId,
    location_id: locationId,
    category_id: outletCategoryId,
    is_accepting_orders: true,
  }

  if (ex?.id) {
    const { error } = await supabase.from('shops').update(row).eq('id', ex.id)
    if (error) throw error
    return ex.id
  }
  const { data, error } = await supabase.from('shops').insert(row).select('id').single()
  if (error) throw error
  return data.id
}

async function clearMenuForShop(supabase, shopId) {
  const { error } = await supabase.from('menu_items').delete().eq('shop_id', shopId)
  if (error) throw error
}

async function insertMenuItems(supabase, shopId, catalog) {
  const rows = []
  for (const cat of catalog.categories || []) {
    const catName = cat.name
    const emoji = defaultEmoji(catName)
    const categoryId = await findOrCreateCategory(supabase, catName, emoji)
    for (const item of cat.items || []) {
      for (const { name, price } of expandItemRows(item)) {
        rows.push({
          shop_id: shopId,
          category_id: categoryId,
          name,
          price,
          description: '',
          is_available: true,
        })
      }
    }
  }
  const chunk = 80
  for (let i = 0; i < rows.length; i += chunk) {
    const part = rows.slice(i, i + chunk)
    const { error } = await supabase.from('menu_items').insert(part)
    if (error) throw error
  }
  return rows.length
}

async function main() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_KEY

  if (!url || !serviceKey) {
    console.error('Missing VITE_SUPABASE_URL or service role key in .env')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('Seeding users & profiles...')
  const userIds = {}
  for (const u of USER_ROWS) {
    const id = await ensureAuthUser(supabase, u.email, PASSWORD, u.full_name)
    userIds[u.email] = id
    await upsertProfile(supabase, id, { ...u, email: u.email })
  }

  console.log('Location & outlet category...')
  const locationName = 'North Square, VIT Chennai'
  const locationId = await findOrCreateLocation(supabase, locationName)
  const outletCategoryId = await findOrCreateCategory(
    supabase,
    'Campus Food Outlet',
    '🏪'
  )

  console.log('Shops & menus...')
  for (const { email, file } of VENDOR_MENUS) {
    const ownerId = userIds[email]
    if (!ownerId) throw new Error(`Missing user id for ${email}`)

    const raw = readFileSync(join(SEED_DATA, file), 'utf8')
    const catalog = JSON.parse(raw)
    const shopName = catalog.restaurant_name

    const shopId = await upsertShopForOwner(supabase, {
      name: shopName,
      ownerId,
      locationId,
      outletCategoryId,
    })
    console.log(`  Shop "${shopName}" (${shopId}) → ${email}`)

    await clearMenuForShop(supabase, shopId)
    const n = await insertMenuItems(supabase, shopId, catalog)
    console.log(`    Inserted ${n} menu rows`)
  }

  console.log('\nDone. Logins (password for all):', PASSWORD)
  for (const u of USER_ROWS) {
    console.log(`  ${u.role.padEnd(14)} ${u.email}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
