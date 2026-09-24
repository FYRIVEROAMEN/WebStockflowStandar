/* global HTMLRewriter */
// worker/worker.js · OG dinámico por tenant en el edge
// Sirve los assets del SPA y reescribe <head> según el host,
// para que WhatsApp/Facebook/Telegram vean el preview del tenant.

const CACHE_TTL = 300 // 5 min de cache de config por tenant
const HOSTS_SISTEMA = ['stockshop.com.ar', 'www.stockshop.com.ar', 'gestion.stockshop.com.ar']
const SUFIJO = '.stockshop.com.ar'

const escapeAttr = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const host = url.hostname

        // HTML = todo GET que NO sea un asset con extensión
    // (más robusto que Accept: view-source y bots mandan Accept raros)
    const esAsset = /\.(js|mjs|css|map|png|jpe?g|svg|webp|avif|gif|ico|woff2?|ttf|eot|mp4|webm|mp3|txt|xml|json)(\?|$)/i.test(url.pathname)
    const esHtml = request.method === 'GET' && !esAsset

    // Override de test SOLO fuera de *.stockshop.com.ar (local/previews)
    // Acepta "zenstore" o "zenstore.stockshop.com.ar" y lo normaliza
    let override = !host.endsWith('stockshop.com.ar') ? url.searchParams.get('og_debug') : null
    if (override && !override.includes('.')) override = override + SUFIJO

    // 🔑 dominios.subdominio guarda el HOST COMPLETO:
    //    zenstore.stockshop.com.ar → sub = host entero
    let sub = override
    if (!sub && host.endsWith('stockshop.com.ar') && !HOSTS_SISTEMA.includes(host)) {
      sub = host
    }

    console.log('[og] host:', host, '| sub:', sub, '| esHtml:', esHtml)

        const raw = await origen(request, env)
    const response = new Response(raw.body, raw)
    const dbg = (msg) => { response.headers.set('X-OG-Debug', msg); return response }

    if (!esHtml || !sub) return dbg(`skip esHtml=${esHtml} sub=${sub}`)

    const ct = response.headers.get('content-type') || ''
    if (!ct.includes('text/html')) return dbg('skip ct=' + ct)

    const meta = await obtenerMeta(sub, env, ctx, url)
    if (!meta) return dbg('meta-null sub=' + sub)

    const out = reescribirHead(response, meta, url)
    out.headers.set('X-OG-Debug', 'rewritten ' + meta.nombre)
    return out
  }
}

// ---------- ORIGEN: assets locales hoy, S3 mañana ----------
async function origen(request, env) {
  if (env.ORIGIN_URL) {
    const url = new URL(request.url)
    return fetch(new Request(env.ORIGIN_URL.replace(/\/$/, '') + url.pathname + url.search, {
      method: request.method,
      headers: request.headers
    }))
  }
  return env.ASSETS.fetch(request)
}

// ---------- CONFIG DEL TENANT con cache de 5 min ----------
async function obtenerMeta(sub, env, ctx, url) {
  const cache = caches.default
  const cacheKey = new Request(`https://og-cache.internal/${sub}.json`)
  const hit = await cache.match(cacheKey)
  if (hit) {
    console.log('[og] cache hit:', sub)
    return hit.json()
  }

  const headers = {
    apikey: env.SUPABASE_ANON_KEY,
    authorization: `Bearer ${env.SUPABASE_ANON_KEY}`
  }

  const rDom = await fetch(`${env.SUPABASE_URL}/rest/v1/dominios?select=local_id&subdominio=eq.${encodeURIComponent(sub)}`, { headers })
  if (!rDom.ok) return null
  const dom = (await rDom.json())[0]
  if (!dom?.local_id) {
    console.log('[og] sin dominio para:', sub)
    return null
  }

  const rLoc = await fetch(`${env.SUPABASE_URL}/rest/v1/locales?select=nombre,config&id=eq.${dom.local_id}`, { headers })
  if (!rLoc.ok) return null
  const local = (await rLoc.json())[0]
  if (!local) return null

  console.log('[og] tenant encontrado:', local.nombre)

  const cfg = local.config || {}
  const nombre = cfg.nombre_local || local.nombre || sub
  const meta = {
    nombre,
    titulo: `${nombre} — Tienda online`,
    descripcion: cfg.og_description || `Productos de ${nombre} con atención personalizada por WhatsApp.`,
    imagen: cfg.og_image || cfg.logo_url || `${url.origin}/logotipostockshop.png`,
    favicon: cfg.favicon_url || cfg.logo_url || '/favicon.svg'
  }

  ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(meta), {
    headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${CACHE_TTL}` }
  })))
  return meta
}

// ---------- REESCRITURA DEL <head> ----------
function reescribirHead(response, meta, url) {
  const e = escapeAttr
  return new HTMLRewriter()
    .on('title', { element: (el) => el.setInnerContent(meta.titulo) })
    .on('meta[name="description"]', { element: (el) => el.setAttribute('content', meta.descripcion) })
    .on('meta[property="og:title"]', { element: (el) => el.setAttribute('content', meta.titulo) })
    .on('meta[property="og:description"]', { element: (el) => el.setAttribute('content', meta.descripcion) })
    .on('meta[property="og:image"]', { element: (el) => el.setAttribute('content', meta.imagen) })
    .on('meta[property="og:site_name"]', { element: (el) => el.setAttribute('content', meta.nombre) })
    .on('meta[name="twitter:title"]', { element: (el) => el.setAttribute('content', meta.titulo) })
    .on('meta[name="twitter:description"]', { element: (el) => el.setAttribute('content', meta.descripcion) })
    .on('meta[name="twitter:image"]', { element: (el) => el.setAttribute('content', meta.imagen) })
    .on('link[rel="icon"]', { element: (el) => el.setAttribute('href', meta.favicon) })
    .on('link[rel="apple-touch-icon"]', { element: (el) => el.setAttribute('href', meta.favicon) })
    .on('head', { element: (el) => el.append(`<meta property="og:url" content="${e(url.origin)}" />`, { html: true }) })
    .transform(response)
}