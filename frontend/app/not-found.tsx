/**
 * Static 404 page — NO Supabase, NO providers, NO requests.
 * Required for Vercel build (no prerender errors).
 */
export default function NotFound() {
  return (
    <div style={{ margin: 0, fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>404</h1>
      <p>Страница не найдена</p>
      <a href="/">На главную</a>
    </div>
  )
}
