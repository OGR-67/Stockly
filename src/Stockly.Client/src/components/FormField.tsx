interface FormFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    className?: string
}

export function FormField({ label, value, onChange, placeholder, type = 'text', className }: FormFieldProps) {
    return (
        <div className={className}>
            <label className="block text-sm text-stone-500 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                placeholder={placeholder}
            />
        </div>
    )
}
