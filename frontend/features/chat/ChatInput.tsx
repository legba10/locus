'use client'

import { useState } from 'react'
import styles from './chatInput.module.css'

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState('')

  const send = () => {
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Сообщение..."
      />
      <button type="button" className={styles.button} onClick={send}>
        Отправить
      </button>
    </div>
  )
}
