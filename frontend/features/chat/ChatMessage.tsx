'use client'

import { ChatMessageType } from './chat.types'
import styles from './chatMessage.module.css'

export default function ChatMessage({
  message,
  isMine,
}: {
  message: ChatMessageType
  isMine: boolean
}) {
  return (
    <div className={`${styles.row} ${isMine ? styles.mine : ''}`}>
      <div className={styles.bubble}>{message.text}</div>
    </div>
  )
}
