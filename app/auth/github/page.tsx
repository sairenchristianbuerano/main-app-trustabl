'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, Mail, Clock, Users, Shield } from 'lucide-react'
import { Button, Divider } from '@/components/ui'

function GithubIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-text-primary)]">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export default function GitHubAuthPage() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-page)] px-4">
      <div className="w-full max-w-[480px] flex flex-col items-center gap-6">

        {/* Logo connection */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] flex items-center justify-center p-2">
            <Image src="/teal.svg" alt="Trustabl" width={28} height={28} />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-12 border-t border-dashed border-[var(--color-border-muted)]" />
            <Shield size={14} className="text-[var(--color-text-tertiary)]" />
            <span className="w-12 border-t border-dashed border-[var(--color-border-muted)]" />
          </div>
          <div className="w-12 h-12 rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] flex items-center justify-center">
            <GithubIcon size={24} />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-lg font-semibold text-[var(--color-accent-default)]">Trustabl</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">wants access to your GitHub account</p>
        </div>

        {/* Permissions card */}
        <div className="w-full rounded-[var(--radius-card)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] overflow-hidden">
          {/* Authorizing section */}
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Authorizing allows this app to</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-[var(--color-accent-default)] flex-shrink-0" />
                <span className="text-sm text-[var(--color-text-primary)]">Verify your GitHub identity (controlcane)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-[var(--color-accent-default)] flex-shrink-0" />
                <span className="text-sm text-[var(--color-text-primary)]">Know which resources you can access</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-[var(--color-accent-default)] flex-shrink-0" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  Act on your behalf <a href="#" className="text-[var(--color-accent-default)] hover:underline text-xs ml-1">What does this mean?</a>
                </span>
              </div>
            </div>
          </div>

          <Divider />

          {/* Resources section */}
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Resources on your account</h2>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              <div>
                <span className="text-sm text-[var(--color-text-primary)]">Email addresses</span>
                <span className="text-xs text-[var(--color-text-tertiary)] ml-1">(read)</span>
                <p className="text-xs text-[var(--color-text-tertiary)]">View your email addresses</p>
              </div>
            </div>
          </div>

          <Divider />

          {/* App info */}
          <div className="px-5 py-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <Shield size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              <span className="text-xs text-[var(--color-text-tertiary)]"><span className="text-[var(--color-accent-default)]">Trustabl</span> is not owned or operated by GitHub</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              <span className="text-xs text-[var(--color-text-tertiary)]">Created 4 years ago</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              <span className="text-xs text-[var(--color-text-tertiary)]">More than 1K GitHub users</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Button variant="primary" size="lg" className="w-full" onClick={() => {
            if (window.opener) {
              window.opener.postMessage({ type: 'github-oauth-success' }, window.location.origin)
              window.close()
            } else {
              router.push('/dashboard')
            }
          }}>
            Authorize
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => {
            if (window.opener) {
              window.opener.postMessage({ type: 'github-oauth-error', message: 'Authorization cancelled by user.' }, window.location.origin)
              window.close()
            } else {
              router.push('/')
            }
          }}>
            Cancel
          </Button>
        </div>

        {/* Redirect notice */}
        <p className="text-xs text-[var(--color-text-tertiary)] text-center">
          Authorizing will redirect to<br />
          <span className="text-[var(--color-text-secondary)]">https://app.trustabl.ai</span>
        </p>
      </div>
    </div>
  )
}
