import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
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
            <div className="relative">
                <input
                    type="number"
                    min="0"
                    value={value ?? ''}
                    onChange={(e) => onChange(parseNullableInt(e.target.value))}
                    placeholder="—"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                />
                {value !== null && (
                    <button
                        onClick={() => onChange(null)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                        title="Effacer"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                )}
            </div>
        </FieldWrapper>
    )
}
