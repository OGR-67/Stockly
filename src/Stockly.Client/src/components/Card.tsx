interface CardProps {
    children: React.ReactNode
}

export function Card({ children }: CardProps) {
    return (
        <div className="flex items-center gap-3 p-3 bg-cream rounded-xl shadow-sm border border-sage/30">
            {children}
        </div>
    )
}
