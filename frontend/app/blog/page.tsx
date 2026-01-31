'use client'

import Link from 'next/link'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Блог</h1>
        <p className="text-gray-600 mb-6">Скоро здесь появятся материалы.</p>
        <Link href="/" className="text-violet-600 hover:text-violet-700">
          ← На главную
        </Link>
      </div>
    </div>
  )
}
