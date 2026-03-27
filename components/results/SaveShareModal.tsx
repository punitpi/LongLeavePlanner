'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { buildShareUrl, downloadJson } from '@/lib/exportUtils'
import { saveSession } from '@/lib/sessions'
import type { Session } from '@/lib/types'

interface SaveShareModalProps {
  session: Session
  onClose: () => void
}

export function SaveShareModal({ session, onClose }: SaveShareModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  useEffect(() => {
    buildShareUrl(session).then(setShareUrl)
  }, [session])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const obj = JSON.parse(ev.target?.result as string)
        const decoded: Session | null = (obj.id && obj.label && obj.year && Array.isArray(obj.clusters))
          ? obj as Session
          : null
        if (!decoded) {
          setImportError('Invalid plan file.')
          return
        }
        saveSession(decoded)
        router.push('/results')
        onClose()
      } catch {
        setImportError('Could not read file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold text-on-surface">Save &amp; Share</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Share Link */}
        <div className="space-y-2">
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Share Link</p>
          <p className="font-body text-xs text-on-surface-variant">Anyone with this link can open your plan directly.</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              placeholder="Generating…"
              className="flex-1 bg-surface-container rounded-lg px-3 py-2 font-mono text-xs text-on-surface-variant truncate border border-outline-variant/20"
            />
            <Button variant="secondary" onClick={handleCopy} disabled={!shareUrl} className="shrink-0 px-4 py-2 text-sm">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Download JSON */}
        <div className="space-y-2">
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Save to File</p>
          <p className="font-body text-xs text-on-surface-variant">Download a <code>.json</code> file — import it later on any device to restore this plan.</p>
          <Button variant="secondary" onClick={() => downloadJson(session)} className="w-full flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Download .json
          </Button>
        </div>

        {/* Import JSON */}
        <div className="space-y-2">
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Import Plan</p>
          <p className="font-body text-xs text-on-surface-variant">Restore a previously saved <code>.json</code> plan file.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">folder_open</span>
            Import .json
          </Button>
          {importError && (
            <p className="text-error text-xs font-body">{importError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
