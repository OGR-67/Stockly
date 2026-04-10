import { getExpiryStatus, expiryBadgeClass, expiryLabel } from '../../utils/expiryStatus'

interface ExpiryBadgeProps {
    date: Date | null | undefined
}

export function ExpiryBadge({ date }: ExpiryBadgeProps) {
    const status = getExpiryStatus(date)
    if (!status || status === 'ok') return null
    return (
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${expiryBadgeClass[status]}`}>
            {expiryLabel[status]}
        </span>
    )
}
