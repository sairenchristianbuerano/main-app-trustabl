'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dropdown } from './Dropdown'

interface PaginationProps {
  variant?: 'inline' | 'sticky'
  stickyLeftOffset?: number
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function getPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, '...', total]
  if (current >= total - 2) return [1, '...', total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export function Pagination({
  variant = 'inline', stickyLeftOffset = 0, currentPage, totalPages, totalItems, pageSize,
  pageSizeOptions = [10, 20, 50, 100], onPageChange, onPageSizeChange,
}: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)
  const pages = getPages(currentPage, totalPages)

  const dropdownOptions = pageSizeOptions.map(o => ({ label: String(o), value: String(o) }))

  const content = (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          Rows per page
          <div className="w-[72px]">
            <Dropdown
              options={dropdownOptions}
              value={String(pageSize)}
              onChange={(v) => onPageSizeChange(Number(v))}
            />
          </div>
        </div>
        <span className="text-sm text-[var(--color-text-secondary)]">
          Showing <span className="text-[var(--color-text-primary)]">{start}–{end}</span> of <span className="text-[var(--color-text-primary)]">{totalItems}</span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] text-[var(--color-text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-raised)]"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={['w-8 h-8 flex items-center justify-center rounded-[var(--radius-sharp)] text-sm font-medium transition-[background] duration-150', currentPage === page ? 'bg-[var(--color-bg-raised)] text-[var(--color-text-primary)] border border-[var(--color-border-muted)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-raised)]'].join(' ')}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sharp)] border border-[var(--color-border-muted)] text-[var(--color-text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-raised)]"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </>
  )

  if (variant === 'sticky') {
    return (
      <div className="fixed bottom-0 right-0 flex items-center justify-between px-6 py-3 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-muted)]" style={{ left: stickyLeftOffset, zIndex: 'var(--z-toast)' }}>
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-base)] border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
      {content}
    </div>
  )
}
