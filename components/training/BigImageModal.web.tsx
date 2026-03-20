import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getPhotoUrl } from '@/utils/photos'

type BigImageModalProps = {
  photos: string[]
  visible: boolean
  onDismiss: () => void
  initialIndex?: number
}

const BigImageModal = (props: BigImageModalProps) => {
  const { photos, visible, onDismiss, initialIndex = 0 } = props
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    if (visible) setCurrentIndex(initialIndex ?? 0)
  }, [visible, initialIndex])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  const url = useMemo(() => getPhotoUrl(photos[currentIndex] ?? ''), [photos, currentIndex])
  const canPrev = photos.length > 1 && currentIndex > 0
  const canNext = photos.length > 1 && currentIndex < photos.length - 1

  if (!visible) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => onDismiss()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxWidth: 1200,
          maxHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => onDismiss()}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 40,
            height: 40,
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontSize: 22,
            cursor: 'pointer',
          }}
          aria-label="Close"
          type="button"
        >
          ×
        </button>

        {photos.length > 1 ? (
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              pointerEvents: 'none',
            }}
          >
            {currentIndex + 1} / {photos.length}
          </div>
        ) : null}

        {photos.length > 1 ? (
          <button
            type="button"
            aria-label="Previous image"
            disabled={!canPrev}
            onClick={() => canPrev && setCurrentIndex((v) => Math.max(0, v - 1))}
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              borderRadius: 22,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              fontSize: 22,
              cursor: canPrev ? 'pointer' : 'not-allowed',
              opacity: canPrev ? 1 : 0.35,
            }}
          >
            ‹
          </button>
        ) : null}

        <img
          src={url}
          alt=""
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 8,
          }}
        />

        {photos.length > 1 ? (
          <button
            type="button"
            aria-label="Next image"
            disabled={!canNext}
            onClick={() => canNext && setCurrentIndex((v) => Math.min(photos.length - 1, v + 1))}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              borderRadius: 22,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              fontSize: 22,
              cursor: canNext ? 'pointer' : 'not-allowed',
              opacity: canNext ? 1 : 0.35,
            }}
          >
            ›
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export default BigImageModal

