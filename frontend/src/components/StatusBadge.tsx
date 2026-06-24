import { cn, statusColors, statusLabels } from '../lib/utils'

interface Props {
  status: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      statusColors[status] || 'bg-gray-100 text-gray-600',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    )}>
      {statusLabels[status] || status}
    </span>
  )
}
