'use client'

import { ReactNode } from 'react'
import styles from './chat.module.css'

export default function ChatLayout({
  header,
  messages,
  input,
}: {
  header: ReactNode
  messages: ReactNode
  input: ReactNode
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>{header}</div>
      <div className={styles.messages}>{messages}</div>
      <div className={styles.input}>{input}</div>
    </div>
  )
}
