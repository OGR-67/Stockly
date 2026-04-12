import { Badge } from './Badge'

interface RecipeTypeBadgeProps {
    type: 'main' | 'dessert'
}

export function RecipeTypeBadge({ type }: RecipeTypeBadgeProps) {
    return <Badge variant="earth">{type === 'main' ? 'Plat' : 'Dessert'}</Badge>
}
