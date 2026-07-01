'use client'
import { useState } from 'react'
import { Unlink } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import { FormLayout } from '@/components/patterns/FormLayout'
import { useToast } from '@/components/ui/ToastContext'
import { GitHubConnectModal } from '@/app/(app)/repositories/GitHubConnectModal'
import { GitHubIcon } from '@/app/(app)/repositories/GitHubIcon'

function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0012 23z" />
      <path fill="#FBBC05" d="M5.84 13.1a6.6 6.6 0 010-4.2V6.06H2.18a11 11 0 000 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 002.18 6.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}

export default function AccountSettingsPage() {
  const { toast } = useToast()
  const [githubConnected, setGithubConnected] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)

  const handleConnect = () => {
    setGithubConnected(true)
    setConnectOpen(false)
    toast('GitHub connected successfully')
  }

  const handleDisconnect = () => {
    setGithubConnected(false)
    toast('GitHub disconnected')
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-12 pb-6 flex flex-col items-center">
      <div className="w-full max-w-[640px] flex flex-col gap-6">
        <FormLayout title="Sign-in method" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center gap-4">
            <Avatar type="initials" initials="ZF" size="md" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Zane Flores</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">zanexflores@gmail.com</p>
            </div>
            <div className="flex items-center gap-2">
              <GoogleIcon size={14} />
              <span className="text-sm text-[var(--color-text-primary)]">Google</span>
            </div>
          </div>
        </FormLayout>

        <FormLayout title="Repository access" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[var(--radius-sharp)] bg-[var(--color-bg-raised)] border border-[var(--color-border-muted)] flex items-center justify-center">
                <GitHubIcon size={16} className="text-[var(--color-text-tertiary)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">GitHub</p>
                {githubConnected && (
                  <span className="text-xs text-[var(--color-text-tertiary)] mt-0.5">@zanexflores &middot; connected just now</span>
                )}
              </div>
            </div>
            {githubConnected ? (
              <Button variant="ghost" size="sm" icon={Unlink} onClick={handleDisconnect}>Disconnect</Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setConnectOpen(true)}>Connect GitHub</Button>
            )}
          </div>
        </FormLayout>
      </div>

      <GitHubConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} onSuccess={handleConnect} />
    </main>
  )
}
