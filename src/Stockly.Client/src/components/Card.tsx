interface CardProps {
    children: React.ReactNode
    onClick?: () => void
    className?: string
}

export function Card({ children, onClick, className = '' }: CardProps) {
    const baseClasses = 'flex items-center gap-3 p-3 bg-cream rounded-xl shadow-sm border border-sage/30'
    const interactiveClasses = onClick ? 'cursor-pointer hover:bg-sage-light/30' : ''

    return (
        <div
            onClick={onClick}
            className={`${baseClasses} ${interactiveClasses} ${className}`}
        >
            {children}
        </div>
    )
}
