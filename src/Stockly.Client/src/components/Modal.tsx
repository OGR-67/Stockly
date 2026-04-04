import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

interface ModalProps {
    title: string
    children: React.ReactNode
    onClose: () => void
}

export function Modal({ title, children, onClose }: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-cream rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-bark">{title}</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}
