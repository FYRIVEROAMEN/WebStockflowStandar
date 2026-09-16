// ============================================
// STOCKFLOW · tenantUrl (WEB)
// Convierte un host de tenant en URL navegable:
// dev simula con ?dominio= · prod usa el dominio real
// ============================================

export const urlMiTienda = (host) => {
  const dev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  return dev ? `/?dominio=${host}` : `https://${host}`
}