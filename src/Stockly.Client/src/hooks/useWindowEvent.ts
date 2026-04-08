import { useEffect } from 'react'

export function useWindowEvent<T = void>(event: string, handler: (detail: T) => void) {
    useEffect(() => {
        function listener(e: Event) {
            handler((e as CustomEvent<T>).detail)
        }
        window.addEventListener(event, listener)
        return () => window.removeEventListener(event, listener)
    }, [])
}
