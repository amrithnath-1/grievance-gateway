import { STATUS_COLORS } from '@/lib/constants';

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || 'status-submitted';
  return <span className={`status-badge ${colorClass}`}>{status}</span>;
}
