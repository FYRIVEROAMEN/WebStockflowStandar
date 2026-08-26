import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLocal } from '../context/LocalContext'

// Inyecta los píxeles del tenant SOLO si los configuró.
// Trackea PageView en cada cambio de ruta (SPA-friendly).
export default function PixelManager() {
  const { config } = useLocal()
  const { pathname } = useLocation()
  const meta = config?.pixel_meta || ''
  const tiktok = config?.pixel_tiktok || ''

  // Meta Pixel: carga única
  useEffect(() => {
    if (!meta || window.fbq) return
    const script = document.createElement('script')
    script.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${meta}');
      fbq('track', 'PageView');
    `
    document.head.appendChild(script)
  }, [meta])

  // TikTok Pixel: carga única
  useEffect(() => {
    if (!tiktok || window.ttq) return
    const script = document.createElement('script')
    script.innerHTML = `
      !function(w,d,t){w.ttq=w.ttq||[];w.ttq.methods=["track","ident","page"];
      w.ttq.queue=[];w.ttq.load=function(e){var n=d.createElement("script");
      n.async=!0;n.src=t+"?sdkid="+e+"&lib="+t;var o=d.getElementsByTagName("script")[0];
      o.parentNode.insertBefore(n,o)};}(window,document,'https://analytics.tiktok.com/i18n/pixel/events.js');
      ttq.load('${tiktok}');
      ttq.page();
    `
    document.head.appendChild(script)
  }, [tiktok])

  // PageView en cada cambio de ruta (SPA)
  useEffect(() => {
    if (window.fbq) window.fbq('track', 'PageView')
    if (window.ttq) window.ttq.page()
  }, [pathname])

  return null
}