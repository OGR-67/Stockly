type BadgeVariant = 'earth' | 'sage' | 'orange' | 'stone'

interface BadgeProps {
    children: React.ReactNode
    variant: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
    earth: 'bg-earth/10 text-earth',
    sage: 'bg-sage/30 text-bark',
    orange: 'bg-orange-100 text-orange-700',
    stone: 'bg-stone-100 text-stone-600',
}

export function Badge({ children, variant }: BadgeProps) {
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${variantStyles[variant]}`}>
            {children}
        </span>
    )
}
