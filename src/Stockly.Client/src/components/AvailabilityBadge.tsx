import { Badge } from './Badge'

interface AvailabilityBadgeProps {
    missing: number
}

export function AvailabilityBadge({ missing }: AvailabilityBadgeProps) {
    if (missing === 0) {
        return <Badge variant="sage">✓ Disponible</Badge>
    }
    return (
        <Badge variant="orange">
            ✗ {missing} manquant{missing > 1 ? 's' : ''}
        </Badge>
    )
}
