'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) { dialog.showModal() } else { dialog.close() }
  }, [open])

  function handleClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  function handleCancel(e: React.SyntheticEvent) {
    e.preventDefault()
    onClose()
  }

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={handleCancel}
      className={cn('rounded-2xl p-0 shadow-2xl border-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm w-full mx-auto my-auto', sizeStyles[size], className)}
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="flex flex-col max-h-[90vh]">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: '#E5E7EB' }}>
            <h2 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-black/5" aria-label="Close" style={{ color: '#5C5C5C' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </dialog>
  )
}
