'use client'

import { useEffect, useState } from 'react'
import { recolorPng } from '@/lib/recolorImage'
import { PALETTES, type PaletteKey } from '@/lib/palettes'
import { DELIMITERS } from '@/lib/delimiters'

interface Props {
  delimiterId: string
  palette: PaletteKey
  width?: number
}

export function LuxeDelimiter({ delimiterId, palette, width = 200 }: Props) {
  const [recoloredSrc, setRecoloredSrc] = useState<string>('')
  const original = DELIMITERS.find(d => d.id === delimiterId)?.url

  useEffect(() => {
    if (!original) return
    const targetColor = PALETTES[palette].main
    recolorPng(original, targetColor).then(setRecoloredSrc).catch(() => {})
  }, [original, palette])

  if (!original || !recoloredSrc) return null

  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={recoloredSrc}
        alt=""
        style={{ width: `${width}px`, maxWidth: '60%', height: 'auto' }}
        aria-hidden="true"
      />
    </div>
  )
}
