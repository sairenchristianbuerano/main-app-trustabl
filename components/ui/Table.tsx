import { ChevronUp, ChevronDown } from 'lucide-react'
import { Checkbox } from './Checkbox'

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface TableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  selectable?: boolean
  selectedRows?: string[]
  onSelect?: (ids: string[]) => void
  sortKey?: keyof T
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: keyof T) => void
  onRowClick?: (row: T) => void
}

const EDGE_PX = 24
const INNER_PX = 16

export function Table<T extends { id: string }>({
  columns, data, selectable, selectedRows = [], onSelect, sortKey, sortDirection, onSort, onRowClick,
}: TableProps<T>) {
  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && !allSelected

  const toggleAll = () => onSelect?.(allSelected ? [] : data.map(r => r.id))
  const toggleRow = (id: string) => onSelect?.(selectedRows.includes(id) ? selectedRows.filter(r => r !== id) : [...selectedRows, id])

  const cellStyle = (i: number): React.CSSProperties => {
    const isFirst = !selectable && i === 0
    const isLast = i === columns.length - 1
    return {
      paddingLeft: isFirst ? EDGE_PX : INNER_PX,
      paddingRight: isLast ? EDGE_PX : INNER_PX,
    }
  }

  const alignClass = (col: Column<T>) => {
    if (col.align === 'center') return 'text-center'
    if (col.align === 'right') return 'text-right'
    return 'text-left'
  }

  return (
    <div className="rounded-[var(--radius-base)] border border-[var(--color-border-muted)] overflow-visible">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border-muted)]">
            {selectable && (
              <th className="w-[4%] py-2.5 rounded-tl-[var(--radius-base)]" style={{ paddingLeft: EDGE_PX, paddingRight: 0 }}>
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              </th>
            )}
            {columns.map((col, i) => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && onSort?.(col.key)}
                style={cellStyle(i)}
                className={[
                  'py-2.5 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide group/th',
                  alignClass(col),
                  col.sortable ? 'cursor-pointer hover:text-[var(--color-text-secondary)]' : '',
                  col.width ?? '',
                  !selectable && i === 0 ? 'rounded-tl-[var(--radius-base)]' : '',
                  i === columns.length - 1 ? 'rounded-tr-[var(--radius-base)]' : '',
                ].filter(Boolean).join(' ')}
              >
                <span className={['flex items-center gap-1', col.align === 'center' ? 'justify-center' : ''].filter(Boolean).join(' ')}>
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDirection === 'asc'
                      ? <ChevronUp size={12} className="text-[var(--color-text-primary)]" />
                      : <ChevronDown size={12} className="text-[var(--color-text-primary)]" />
                  )}
                  {col.sortable && sortKey !== col.key && (
                    <ChevronUp size={12} className="opacity-0 group-hover/th:opacity-30 transition-opacity" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const isSelected = selectedRows.includes(row.id)
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={['border-b border-[var(--color-border-muted)] last:border-0 transition-[background] duration-100', onRowClick ? 'cursor-pointer' : '', isSelected ? 'bg-[var(--color-bg-overlay)]' : 'hover:bg-[var(--color-bg-surface)]'].filter(Boolean).join(' ')}
              >
                {selectable && (
                  <td className="w-[4%] py-3" style={{ paddingLeft: EDGE_PX, paddingRight: 0 }} onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={isSelected} onChange={() => toggleRow(row.id)} />
                  </td>
                )}
                {columns.map((col, i) => (
                  <td
                    key={String(col.key)}
                    style={cellStyle(i)}
                    className={['py-3 text-sm text-[var(--color-text-primary)] h-[52px] align-middle', alignClass(col)].join(' ')}
                  >
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
