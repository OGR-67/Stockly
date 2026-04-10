import { FieldWrapper } from './FieldWrapper'

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
        <FieldWrapper label={label} className={className}>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                placeholder={placeholder}
            />
        </FieldWrapper>
    )
}
