import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'

interface ConfirmButtonProps {
    onClick?: () => void
    disabled?: boolean
    loading?: boolean
    label?: string
    type?: 'button' | 'submit'
}

export function ConfirmButton({ onClick, disabled, loading, label = 'Confirmer', type = 'button' }: ConfirmButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-earth text-white font-medium disabled:opacity-50"
        >
            <FontAwesomeIcon icon={loading ? faSpinner : faCheck} spin={loading} />
            {label}
        </button>
    )
}
