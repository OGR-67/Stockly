import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'

interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher...', className = '' }: SearchInputProps) {
    return (
        <div className={`flex items-center border border-stone-300 rounded-lg px-3 py-2 gap-2 bg-cream ${className}`}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-stone-400" />
            <input
                className="flex-1 outline-none text-sm bg-transparent"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="text-stone-400 hover:text-stone-600 transition-colors"
                    title="Effacer"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            )}
        </div>
    )
}
