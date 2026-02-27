'use client'

import Link from 'next/link'
import Image from 'next/image'

export interface ChatListingPreviewProps {
  listingId?: string
  listingTitle?: string
  listingPhotoUrl?: string
  listingPrice?: string
  /** TZ-64: закреплённая карточка, не исчезает при клавиатуре */
  sticky?: boolean
}

export function ChatListingPreview({
  listingId,
  listingTitle,
  listingPhotoUrl,
  listingPrice,
  sticky = true,
}: ChatListingPreviewProps) {
  const show = listingId || listingTitle || listingPhotoUrl
  if (!show) return null

  const content = (
    <>
      {listingPhotoUrl && (
        <div className="chat-listing-preview__photo relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-secondary)]">
          <Image src={listingPhotoUrl} alt="" fill className="object-cover" sizes="56px" />
        </div>
      )}
      <div className="chat-listing-preview__text min-w-0 flex-1">
        {listingTitle && (
          <p className="chat-listing-preview__title truncate">{listingTitle}</p>
        )}
        {listingPrice && (
          <p className="chat-listing-preview__price">{listingPrice}</p>
        )}
      </div>
      {listingId ? (
        <span className="chat-listing-preview__btn">Открыть</span>
      ) : null}
    </>
  )

  const className = `chat-listing-preview ${sticky ? 'chat-listing-preview--sticky' : ''}`

  if (listingId) {
    return (
      <Link href={`/listings/${listingId}`} className={className}>
        {content}
      </Link>
    )
  }
  return <div className={className}>{content}</div>
}
