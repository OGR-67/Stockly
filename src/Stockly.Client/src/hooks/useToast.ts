import { useState } from 'react'

export function useToast(duration = 3000) {
    const [toast, setToast] = useState<string | null>(null)

    function showToast(message: string) {
        setToast(message)
        setTimeout(() => setToast(null), duration)
    }

    return { toast, showToast }
}
