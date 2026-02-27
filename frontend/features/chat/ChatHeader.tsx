'use client'

import { ChatUser, ChatAd } from './chat.types'
import styles from './chatHeader.module.css'

export default function ChatHeader({
  user,
  ad,
  onBack,
}: {
  user: ChatUser
  ad: ChatAd
  onBack?: () => void
}) {
  return (
    <div className={styles.container}>
      {onBack && (
        <button type="button" className={styles.back} onClick={onBack} aria-label="Назад">
          ←
        </button>
      )}
      <div className={styles.user}>
        <img src={user.avatar || '/avatar.png'} alt="" />
        <div>
          <div className={styles.name}>{user.name}</div>
          <div className={styles.adTitle}>{ad.title}</div>
        </div>
      </div>
    </div>
  )
}
