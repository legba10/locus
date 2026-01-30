'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/shared/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/Card'

export default function RouterTestPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Router test</CardTitle>
          <p className="mt-1 text-sm text-text-mut">
            Click the button — should navigate client-side (no full reload). Right-click -&gt; open
            in new tab should also work.
          </p>
        </CardHeader>
        <CardBody className="space-y-3">
          <Button
            onClick={() => {
              router.push('/register')
            }}
          >
            Go to /register
          </Button>

          <div className="rounded-xl border border-border bg-white/3 p-4 text-sm">
            <p className="font-medium">Anchor check</p>
            <p className="mt-1 text-text-mut">
              This should behave like a normal browser link (new tab, copy link, etc.).
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a href="/register" className="text-brand hover:underline">
                Open /register (anchor)
              </a>
              <Link href="/auth/register" className="text-brand hover:underline">
                Open /auth/register (Next Link)
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

