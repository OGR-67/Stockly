import { FieldWrapper } from '../FieldWrapper'

interface DaysInputProps {
    label: string
    value: number | null
    onChange: (v: number | null) => void
}

function parseNullableInt(value: string): number | null {
    const n = parseInt(value, 10)
    return isNaN(n) ? null : n
}

export function DaysInput({ label, value, onChange }: DaysInputProps) {
    return (
        <FieldWrapper label={label}>
            <input
                type="number"
                min="0"
                value={value ?? ''}
                onChange={(e) => onChange(parseNullableInt(e.target.value))}
                placeholder="—"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
            />
        </FieldWrapper>
    )
}
