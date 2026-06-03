'use client'

import { useEffect, useState } from 'react'
import { recolorPng } from '@/lib/recolorImage'
import { PALETTES, type PaletteKey } from '@/lib/palettes'

interface Props {
  monogramUrl: string
  palette: PaletteKey
  opacity?: number
}

export function LuxeMonogramWatermark({ monogramUrl, palette, opacity = 0.15 }: Props) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    recolorPng(monogramUrl, PALETTES[palette].main).then(setSrc).catch(() => {})
  }, [monogramUrl, palette])

  if (!src) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{
          width: '70%',
          maxWidth: '320px',
          opacity,
        }}
      />
    </div>
  )
}
