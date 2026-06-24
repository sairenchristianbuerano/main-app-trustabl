'use client'
import { Check, X } from 'lucide-react'
import { Button, Badge } from '@/components/ui'

interface PlanFeature {
  label: string
  included: boolean
}

interface Plan {
  name: string
  price: string
  subtitle?: string
  badge?: string
  features: PlanFeature[]
  cta: string
  ctaVariant: 'primary' | 'secondary' | 'ghost'
  highlight?: boolean
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    subtitle: 'Forever',
    features: [
      { label: 'OSS Analyzer + Remediation Skill', included: true },
      { label: 'Limited SigStore signing', included: true },
      { label: 'Cloud dashboard', included: false },
    ],
    cta: 'Current plan',
    ctaVariant: 'ghost',
  },
  {
    name: 'Team',
    price: '$29–49',
    subtitle: 'per user/mo',
    badge: 'Popular',
    features: [
      { label: 'Cloud dashboard', included: true },
      { label: 'Repositories, History, Reconciliation, Policy', included: true },
      { label: 'Team management (10 users, 10 repos)', included: true },
      { label: 'Full attestations, SSO', included: true },
    ],
    cta: 'Upgrade to Team',
    ctaVariant: 'primary',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'starting $15k/yr',
    features: [
      { label: 'Everything in Team +', included: true },
      { label: 'Multiple workspaces', included: true },
      { label: 'Advanced Policy Builder', included: true },
      { label: 'Policy ingestion from docs', included: true },
      { label: 'Directory integration (Okta, Entra ID)', included: true },
      { label: 'Self-hosted / on-prem', included: true },
      { label: 'SLM/RAG in customer environment', included: true },
    ],
    cta: 'Contact Sales',
    ctaVariant: 'secondary',
  },
]

export default function PricingPage() {
  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-[960px] flex flex-col gap-8">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Choose your plan</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Start free, upgrade when your team needs more.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={[
                'rounded-[var(--radius-card)] border p-6 flex flex-col gap-5',
                plan.highlight
                  ? 'border-[var(--color-accent-default)] bg-[var(--color-bg-surface)]'
                  : 'border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]',
              ].join(' ')}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">{plan.name}</span>
                  {plan.badge && <Badge variant="info" size="sm">{plan.badge}</Badge>}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-[var(--color-text-primary)]">{plan.price}</span>
                  {plan.subtitle && <span className="text-xs text-[var(--color-text-tertiary)]">{plan.subtitle}</span>}
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2.5">
                {plan.features.map(f => (
                  <div key={f.label} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check size={14} className="text-[var(--color-success-text)] flex-shrink-0 mt-0.5" />
                    ) : (
                      <X size={14} className="text-[var(--color-text-disabled)] flex-shrink-0 mt-0.5" />
                    )}
                    <span className={['text-xs leading-relaxed', f.included ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-disabled)]'].join(' ')}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              <Button variant={plan.ctaVariant} disabled={plan.cta === 'Current plan'} className="w-full">
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-[var(--color-text-tertiary)]">
          Team plans also available at $199–399/team/mo. All prices billed annually.
        </p>
      </div>
    </main>
  )
}
