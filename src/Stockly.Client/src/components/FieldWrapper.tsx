interface FieldWrapperProps {
    label: string
    children: React.ReactNode
    className?: string
}

export function FieldWrapper({ label, children, className }: FieldWrapperProps) {
    return (
        <div className={className}>
            <label className="block text-sm text-stone-500 mb-1">{label}</label>
            {children}
        </div>
    )
}
