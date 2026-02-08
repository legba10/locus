'use client'

import { useEffect, useState } from 'react'

const FRONTEND_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0'
const FRONTEND_BUILD = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_BUILD_ID ?? ''

export default function HealthPage() {
  const [backend, setBackend] = useState<{ version?: string; buildDate?: string; ok?: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setBackend(data))
      .catch((e) => setError(String(e)))
  }, [])

  return (
    <div className="min-h-screen p-8 font-mono text-sm bg-gray-50">
      <h1 className="text-xl font-bold mb-4">Health / Deploy sync</h1>
      <div className="space-y-2">
        <p><strong>Frontend version:</strong> {FRONTEND_VERSION}</p>
        <p><strong>Frontend build:</strong> {FRONTEND_BUILD || '—'}</p>
        {backend && (
          <>
            <p><strong>Backend version:</strong> {backend.version ?? '—'}</p>
            <p><strong>Backend build date:</strong> {backend.buildDate ?? '—'}</p>
            <p><strong>Backend ok:</strong> {String(backend.ok)}</p>
          </>
        )}
        {error && <p className="text-red-600">Backend: {error}</p>}
      </div>
    </div>
  )
}
