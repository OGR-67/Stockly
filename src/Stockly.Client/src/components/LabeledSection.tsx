interface LabeledSectionProps {
    title: string
    children: React.ReactNode
}

export function LabeledSection({ title, children }: LabeledSectionProps) {
    return (
        <div>
            <h3 className="text-sm font-medium text-bark mb-2">{title}</h3>
            {children}
        </div>
    )
}
