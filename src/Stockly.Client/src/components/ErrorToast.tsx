import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../hooks/useToast'
import { useWindowEvent } from '../hooks/useWindowEvent'
import { haptic } from 'ios-haptics'

export function ErrorToast() {
    const { toast, showToast } = useToast(4000)
    useWindowEvent<string>('api-error', (message) => {
        haptic.error()
        showToast(message)
    })

    if (!toast) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 z-60 flex items-center gap-3 bg-red-600 text-white text-sm py-3 px-4 rounded-xl shadow-lg">
            <FontAwesomeIcon icon={faTriangleExclamation} className="shrink-0" />
            <span>{toast}</span>
        </div>
    )
}
